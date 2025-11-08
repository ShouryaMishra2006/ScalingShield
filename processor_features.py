import os
import re
import time
import joblib
import numpy as np
import hashlib
from datetime import datetime
from ipaddress import ip_address, ip_network

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "isolation.pkl")

class Detector:
    def __init__(self, model_path=MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._ensure_model()

    def _ensure_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception:
                self.model = None
        if self.model is None:
            from sklearn.ensemble import IsolationForest
            X = np.random.normal(size=(200,4))
            m = IsolationForest(n_estimators=50, contamination=0.05, random_state=42)
            m.fit(X)
            joblib.dump(m, self.model_path)
            self.model = m

    def anomaly_score(self, vector):
        """Return normalized anomaly score in 0..1 (1 = more anomalous)."""
        if self.model is None:
            return 0.0
        val = float(self.model.decision_function([vector])[0]) 
        score = max(0.0, min(1.0, (0.5 - val) * 2.0))
        return score

detector = Detector()

CORP_SUBNETS = [
    ip_network("10.0.0.0/8"),
    ip_network("192.168.0.0/16"),
    ip_network("172.16.0.0/12"),
]

COMMON_PORTS = {22, 80, 443, 53, 3389, 445, 139} 
SUSPICIOUS_PROCESS_KEYWORDS = ["mimikatz", "procdump", "proc_dump", "rundll32", "powershell -enc"]
CREDENTIAL_FILE_PATTERNS = [
    r"sam", r"ntds", r"lsass", r"cache", r"vault", r"credentials", r"password", r"token"
]

def is_ip_external(ip_str):
    """Return True if IP is not in corporate subnets. Handles empty/malformed safely."""
    try:
        ip = ip_address(ip_str)
    except Exception:
        return False
    for net in CORP_SUBNETS:
        if ip in net:
            return False

    return True

def is_process_suspicious(image_path, command_line=None):
    low = (image_path or "").lower()
    cmd = (command_line or "").lower()
    for kw in SUSPICIOUS_PROCESS_KEYWORDS:
        if kw in low or kw in cmd:
            return True
    return False

def matches_credential_file(target_filename):
    if not target_filename:
        return False
    fn = target_filename.lower()
    for pat in CREDENTIAL_FILE_PATTERNS:
        if re.search(pat, fn):
            return True
    return False

def parse_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return default

def port_unusual(port):
    """Return score/flag for unusual port usage. 0 = common, 1 = unusual."""
    if not port:
        return 0
    try:
        p = int(port)
    except Exception:
        return 0
    if p in COMMON_PORTS:
        return 0
    if 49152 <= p <= 65535:
        return 0.2
    return 1

def domain_from_hostname(hostname):
    if not hostname:
        return None
    parts = hostname.split(".")
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return hostname

def domain_reputation_stub(domain):
    """Placeholder: return 0..1 reputation (1 = bad). Replace with real lookup."""
    if not domain:
        return 0.0
    bad_indicators = ["malicious", "suspicious", "bad", "phish", "exfil", "cloudfront", "akamaicdn"]
    d = domain.lower()
    for b in bad_indicators:
        if b in d:
            return 1.0
    return 0.0


def extract_and_score(log: dict, user_history=None):
    """
    Input: raw Sysmon-like log dict (structure of your sample).
    user_history: optional dict with historical metrics for user or host (e.g., events_per_day)
    Returns: (features_dict, numeric_vector, rule_score, anomaly_score, risk_score, flags)
    """
    raw = log.get("raw", {}) or {}
    features = {}
    flags = {}
    timestamp = log.get("timestamp") or raw.get("UtcTime")
    features["timestamp"] = timestamp

    image = (raw.get("Image") or raw.get("image") or log.get("source") or "").strip()
    cmdline = (raw.get("CommandLine") or raw.get("Command") or "")
    targetfile = raw.get("TargetFilename") or raw.get("TargetFileName") or ""
    user = raw.get("User") or raw.get("TargetUserName") or None
    dest_ip = raw.get("DestinationIp") or raw.get("DestinationIpAddress") or raw.get("DestIp") or ""
    dest_host = raw.get("DestinationHostname") or raw.get("DestinationHost") or raw.get("DestHost") or ""
    dest_port = raw.get("DestinationPort") or raw.get("DestinationPortName") or raw.get("DestPort") or None
    protocol = (raw.get("Protocol") or "").lower()

    features.update({
        "image": image,
        "command_line": cmdline,
        "target_file": targetfile,
        "user": user,
        "destination_ip": dest_ip,
        "destination_host": dest_host,
        "destination_port": parse_int(dest_port, 0),
        "protocol": protocol,
    })

    # 1)Is destination IP outside corporate subnet?
    external_ip = False
    if dest_ip:
        external_ip = is_ip_external(dest_ip)
    features["is_external_ip"] = int(bool(external_ip))
    flags["is_external_ip"] = external_ip

    # 2)Is process accessing LSASS(credential dump risk)?
    proc_lower = image.lower()
    lsass_access = False
    if "lsass.exe" in proc_lower or "lsass" in (targetfile or "").lower():
        lsass_access = True
    if is_process_suspicious(image, cmdline):
        flags["process_has_known_dumper_keyword"] = True
    features["lsass_access"] = int(lsass_access)
    flags["lsass_access"] = lsass_access

    # 3)Is unusual port or domain contacted?
    port_flag = port_unusual(features["destination_port"])
    features["port_unusual_score"] = float(port_flag)
    domain = domain_from_hostname(dest_host)
    features["dest_domain"] = domain
    domain_rep = domain_reputation_stub(domain)
    features["dest_domain_reputation"] = float(domain_rep)
    flags["port_unusual"] = bool(port_flag > 0.5)
    flags["domain_suspicious"] = domain_rep > 0.5

    # 4)Credential-file access/TargetFilename patterns
    cred_file = matches_credential_file(targetfile)
    features["credential_file_access"] = int(bool(cred_file))
    flags["credential_file_access"] = cred_file

    # 5)Process behavior features
    #-Is process executing from temporary location?
    tmp_indicator = False
    if re.search(r"\\temp\\|\\appdata\\local\\temp\\|\\localstate\\", image.lower()):
        tmp_indicator = True
    features["exec_from_temp"] = int(tmp_indicator)
    flags["exec_from_temp"] = tmp_indicator

    features["process_suspicious_keyword"] = int(is_process_suspicious(image, cmdline))

    #6)Time-of-day feature
    try:
        dt = datetime.strptime(timestamp[:19], "%Y-%m-%dT%H:%M:%S")
        hour = dt.hour
    except Exception:
        try:
            hour = datetime.utcnow().hour
        except Exception:
            hour = 0
    features["hour"] = int(hour)
    #define off-hours as before 6am or after 20pm
    off_hours = (hour < 6 or hour > 20)
    features["off_hours_flag"] = int(off_hours)
    flags["off_hours"] = off_hours




    port_norm = features["destination_port"] / 65535.0 if features["destination_port"] else 0.0
    hour_norm = features["hour"] / 23.0
    if user_history and "user_rate_ratio" in user_history:
      features["user_rate_ratio"] = user_history["user_rate_ratio"]
    else:
      features["user_rate_ratio"] = 0.0  
      uratio_norm = min(10.0, features["user_rate_ratio"]) / 10.0

    vec = [
        port_norm,
        float(features["is_external_ip"]),
        float(features["process_suspicious_keyword"]),
        float(features["credential_file_access"]),
        float(features["exec_from_temp"]),
        hour_norm,
        uratio_norm,
        float(features["dest_domain_reputation"])
    ]
    
    rule_score = 0.0

    if features["lsass_access"] and (features["credential_file_access"] or features["process_suspicious_keyword"]):
        rule_score = max(rule_score, 1.0)
        flags["rule_lsass_credential_dump"] = True
    elif features["process_suspicious_keyword"]:
        rule_score = max(rule_score, 0.8)
        flags["rule_suspicious_process"] = True
    if features["is_external_ip"] and features["credential_file_access"]:
        rule_score = max(rule_score, 0.9)
        flags["rule_exfil_via_file"] = True
    if features["port_unusual_score"] >= 1:
        rule_score = max(rule_score, 0.6)
    if features["dest_domain_reputation"] > 0.5:
        rule_score = max(rule_score, 0.7)
    try:
        anomaly_score = detector.anomaly_score(vec)
    except Exception:
        anomaly_score = 0.0
    w_anom = 0.45
    w_rule = 0.35
    w_other = 0.20  
    risk_score = (w_anom * anomaly_score) + (w_rule * rule_score) + (w_other * 0.0)

    results = {
        "features": features,
        "vector": vec,
        "flags": flags,
        "rule_score": float(rule_score),
        "anomaly_score": float(anomaly_score),
        "risk_score": float(risk_score)
    }
    return results
