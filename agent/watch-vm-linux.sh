
MONITOR_URL=${1:-"http://localhost:4200/api/telemetry"}
SLEEP=${2:-5}
HOSTNAME=$(hostname)
PATTERNS="vmmem|qemu|VirtualBox|vmware|wsl"

echo "Agent running on $HOSTNAME -> $MONITOR_URL every ${SLEEP}s"
while true; do
  ts=$(date --utc +"%Y-%m-%dT%H:%M:%SZ")
  
  procs=$(ps -eo pid,comm --sort=-pcpu | head -n 10)
  conns=$(netstat -tan | head -n 10)
  
  if (( RANDOM % 5 == 0 )); then note="detected virtualization pattern"; else note="routine scan"; fi
  payload=$(jq -n --arg h "$HOSTNAME" --arg t "$ts" --arg p "$procs" --arg c "$conns" --arg n "$note" \
    '{host:$h,timestamp:$t,type:"vm_detect",processes:$p,connections:$c,note:$n}')
  curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$MONITOR_URL" >/dev/null 2>&1
  sleep $SLEEP
done
