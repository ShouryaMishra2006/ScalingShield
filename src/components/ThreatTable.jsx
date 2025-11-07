import { useEffect, useRef } from 'react';

const rowColor = (score) => {
  if (score >= 80) return 'bg-red-500/5';
  if (score >= 50) return 'bg-amber-500/5';
  return '';
};

function ThreatTable({ logs }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-zinc-900">
      <div className="max-h-72 overflow-auto" ref={ref}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-950/60 backdrop-blur">
            <tr className="text-left text-gray-600 dark:text-gray-400">
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Employee</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">IP</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Threat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
            {logs.map((log, idx) => (
              <tr key={idx} className={rowColor(log.threatScore)}>
                <td className="px-3 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="px-3 py-2">{log.employeeID}</td>
                <td className="px-3 py-2">{log.action}</td>
                <td className="px-3 py-2">{log.ip}</td>
                <td className="px-3 py-2">{log.status}</td>
                <td className="px-3 py-2 text-right font-semibold">{log.threatScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ThreatTable;
