import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import HeroScene from './components/HeroScene';
import EmployeeGrid from './components/EmployeeGrid';
import ThreatTable from './components/ThreatTable';

const ACTIONS = ['login', 'file_access', 'usb_insert', 'vpn_connect', 'privilege_change'];
const STATUS = ['ok', 'warning', 'failed'];

const mockEmployees = [
  { id: 'E-1021', name: 'Ava Patel', role: 'Security Analyst', email: 'ava.patel@corp.com', alerts: 2, threatScore: 24, blocked: false },
  { id: 'E-1042', name: 'Liam Chen', role: 'DevOps Engineer', email: 'liam.chen@corp.com', alerts: 5, threatScore: 73, blocked: false },
  { id: 'E-1077', name: 'Maya Johnson', role: 'Finance Manager', email: 'maya.johnson@corp.com', alerts: 1, threatScore: 12, blocked: false },
  { id: 'E-1103', name: 'Noah Garcia', role: 'IT Support', email: 'noah.garcia@corp.com', alerts: 3, threatScore: 58, blocked: false },
  { id: 'E-1119', name: 'Sofia Rossi', role: 'HR Lead', email: 'sofia.rossi@corp.com', alerts: 0, threatScore: 8, blocked: false },
  { id: 'E-1125', name: 'Ethan Müller', role: 'Network Admin', email: 'ethan.muller@corp.com', alerts: 4, threatScore: 86, blocked: false },
];

function randomIP() {
  return `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
}

function App() {
  const [dark, setDark] = useState(true);
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState(mockEmployees);
  const [selected, setSelected] = useState(null);

  // Simulate real-time feed using intervals
  useEffect(() => {
    const interval = setInterval(() => {
      const emp = employees[Math.floor(Math.random() * employees.length)];
      const threat = Math.floor(Math.random() * 100);
      const status = STATUS[threat > 80 ? 2 : threat > 50 ? 1 : 0];
      setLogs((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          employeeID: emp.name,
          action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
          ip: randomIP(),
          status,
          threatScore: threat,
        },
      ].slice(-150));

      setEmployees((prev) => prev.map((e) => e.id === emp.id ? { ...e, alerts: e.alerts + (threat >= 80 ? 1 : 0), threatScore: Math.max(0, Math.min(100, Math.round((e.threatScore * 0.7) + threat * 0.3))) } : e));
    }, 2000);
    return () => clearInterval(interval);
  }, [employees.length]);

  const feedActive = logs.length > 0;

  const topLogs = useMemo(() => logs.slice(-50), [logs]);

  const avgThreat = logs.length ? Math.round(logs.reduce((s, l) => s + l.threatScore, 0) / logs.length) : 0;
  const highAlerts = logs.filter((l) => l.threatScore >= 80).length;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar dark={dark} toggleDark={() => setDark((d) => !d)} feedActive={feedActive} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HeroScene />

        {/* Lightweight analytics summary */}
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

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400">Employees</h3>
            <EmployeeGrid employees={employees} onSelect={setSelected} />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400">Live Threat Logs</h3>
            <ThreatTable logs={topLogs} />
          </div>
        </section>
      </main>

      {/* Simple modal */}
      {selected && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.role} • {selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              >Close</button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Threat</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selected.threatScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm rounded-md border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20">Block Employee</button>
                <button className="px-3 py-1.5 text-sm rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Neutralize Threat</button>
                <button className="px-3 py-1.5 text-sm rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Contact</button>
              </div>
              <div className="mt-4">
                <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Recent Activity</h5>
                <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                  {logs.filter((l) => l.employeeID === selected.name).slice(-10).reverse().map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2">
                      <span>{new Date(l.timestamp).toLocaleTimeString()}</span>
                      <span className="text-gray-600 dark:text-gray-400">{l.action}</span>
                      <span className="font-medium">{l.threatScore}</span>
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
