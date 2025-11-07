import { useMemo } from 'react';
import { Shield, Mail, AlertTriangle, Slash } from 'lucide-react';

const threatColor = (score) => {
  if (score >= 80) return 'bg-red-500/10 text-red-600 border-red-500/20';
  if (score >= 50) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
};

function EmployeeGrid({ employees, onSelect }) {
  const sorted = useMemo(() => {
    return [...employees].sort((a, b) => b.threatScore - a.threatScore);
  }, [employees]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((emp) => (
        <button
          key={emp.id}
          onClick={() => onSelect(emp)}
          className="text-left rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 p-4 hover:border-emerald-500/40 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{emp.role}</p>
              </div>
            </div>
            <span className={`text-[11px] px-2 py-1 rounded-md border ${threatColor(emp.threatScore)}`}>
              Threat {emp.threatScore}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {emp.email}</span>
            <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> {emp.alerts} alerts</span>
            {/* <span className="inline-flex items-center gap-1"><Slash className="h-3.5 w-3.5" /> {emp.blocked ? 'Blocked' : 'Active'}</span> */}
          </div>
        </button>
      ))}
    </div>
  );
}

export default EmployeeGrid;
