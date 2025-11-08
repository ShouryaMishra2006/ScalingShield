import React from "react";

export default function AlertsList({ alerts, onSelect }){
  return (
    <div className="bg-white rounded-xl shadow p-4 max-h-[72vh] overflow-auto">
      <h3 className="font-semibold mb-3">Recent Alerts</h3>
      <ul className="space-y-3">
        {alerts.map((a, i) => (
          <li key={i} className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(a)}>
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-medium">{a.summary}</div>
                <div className="text-xs text-gray-500">{a.evidence?.user || a.evidence?.process || "—"}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${a.score>=0.8? 'text-red-600': a.score>=0.6? 'text-amber-500' : 'text-gray-600'}`}>
                  {a.score?.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">{new Date((a.timestamp||Date.now())*1000).toLocaleString()}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
