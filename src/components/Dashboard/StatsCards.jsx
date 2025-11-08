import React from "react";
import { ShieldCheck, AlertTriangle, Globe } from "lucide-react";

export default function StatsCards({ stats }){
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Total Alerts</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500"/>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">High Risk</div>
            <div className="text-2xl font-bold">{stats.high}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500"/>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">External Connections</div>
            <div className="text-2xl font-bold">{stats.external}</div>
          </div>
          <Globe className="w-8 h-8 text-blue-500"/>
        </div>
      </div>
    </div>
  );
}
