import { useEffect, useMemo, useState } from "react";
import Navbar from "../Navbar";
import HeroScene from "../HeroScene";
import EmployeeGrid from "../EmployeeGrid";
import ThreatTable from "../ThreatTable";

const ACTIONS = ["login", "file_access", "usb_insert", "vpn_connect", "privilege_change"];
const STATUS = ["ok", "warning", "failed"];

function randomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function App() {
  const [dark, setDark] = useState(true);
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    fetch("http://localhost:5000/api/users") 
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);


  useEffect(() => {
    if (employees.length === 0) return;

    const interval = setInterval(() => {
      const emp = employees[Math.floor(Math.random() * employees.length)];
      const threat = Math.floor(Math.random() * 100);
      const status = STATUS[threat > 80 ? 2 : threat > 50 ? 1 : 0];
      const newLog = {
        timestamp: Date.now(),
        employeeID: emp.username,
        action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
        ip: randomIP(),
        status,
        threatScore: threat,
      };
      setLogs((prev) => [...prev, newLog].slice(-150));

      setEmployees((prev) =>
        prev.map((e) =>
          e._id === emp._id
            ? {
                ...e,
                threatScore: Math.max(0, Math.min(100, Math.round((e.threatScore || 0) * 0.7 + threat * 0.3))),
                alerts: (e.alerts || 0) + (threat >= 80 ? 1 : 0),
              }
            : e
        )
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [employees]);

  const feedActive = logs.length > 0;
  const topLogs = useMemo(() => logs.slice(-50), [logs]);
  const avgThreat = logs.length ? Math.round(logs.reduce((s, l) => s + l.threatScore, 0) / logs.length) : 0;
  const highAlerts = logs.filter((l) => l.threatScore >= 80).length;
  const flagEmployee = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}/flag`, {
        method: "PATCH",
      });
      
        setEmployees((prev) =>
          prev.map((e) => (e._id === id ? { ...e, flagged: !e.flagged } : e))
        );
      
    } catch (err) {
      console.error("Error flagging employee:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar dark={dark} toggleDark={() => setDark((d) => !d)} feedActive={feedActive} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HeroScene />

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Events Ingested</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{logs.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active High Alerts</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{highAlerts}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Threat Score</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{avgThreat}</p>
          </div>
        </section>

        {/* Employee Grid + Threat Table */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400">Employees</h3>
            <EmployeeGrid
              employees={employees}
              onSelect={setSelected}
              onFlag={flagEmployee}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400">Live Threat Logs</h3>
            <ThreatTable logs={topLogs} />
          </div>
        </section>
      </main>

      {/* Employee Modal */}
      {selected && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.username}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Threat Score</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selected.threatScore || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => flagEmployee(selected._id)}
                  className={`px-3 py-1.5 text-sm rounded-md border ${
                    selected.flagged
                      ? "border-gray-500/30 bg-gray-500/10 text-gray-500"
                      : "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                  }`}
                >
                  {selected.flagged ? "Unflag Employee" : "Flag Employee"}
                </button>
                <button className="px-3 py-1.5 text-sm rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
                  Neutralize Threat
                </button>
              </div>

              <div className="mt-4">
                <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Recent Behaviour Logs</h5>
                <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                  {(selected.behaviours || []).slice(-10).reverse().map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2"
                    >
                      <span>{new Date(b.timestamp).toLocaleTimeString()}</span>
                      <span className="text-gray-600 dark:text-gray-400">{b.actionType}</span>
                      <span className={b.isAnomalous ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                        {b.isAnomalous ? "Anomaly" : "Normal"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
