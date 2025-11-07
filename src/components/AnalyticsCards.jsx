import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';

function AnalyticsCards({ logs }) {
  const byMinute = logs.reduce((acc, l) => {
    const key = new Date(l.timestamp).toLocaleTimeString([], { minute: '2-digit', hour: '2-digit' });
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(byMinute).map(([k, v]) => ({ time: k, count: v }));

  const avgThreat = logs.length ? Math.round(logs.reduce((s, l) => s + l.threatScore, 0) / logs.length) : 0;
  const highAlerts = logs.filter((l) => l.threatScore >= 80).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4">
        <h3 className="text-sm text-gray-500 dark:text-gray-400">Threats Over Time</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4">
        <h3 className="text-sm text-gray-500 dark:text-gray-400">Active Alerts</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{highAlerts}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Severity ≥ 80</p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4">
        <h3 className="text-sm text-gray-500 dark:text-gray-400">Log Frequency</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Avg threat score: <span className="font-medium text-gray-900 dark:text-white">{avgThreat}</span></p>
      </div>
    </div>
  );
}

export default AnalyticsCards;
