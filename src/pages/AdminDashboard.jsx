import { useState } from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, Activity, Database, KeyRound } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
export default function AdminDashboard() {
  const [dark, setDark] = useState(true);
  
  const [serviceActive, setServiceActive] = useState(false);
  const navigate = useNavigate();
  return (
    <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <Navbar dark={dark} toggleDark={() => setDark((d) => !d)} feedActive={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage employee activities, monitor shared database & local credentials security logs, and control website protection during scaling.
          </p>
        </section>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Employee Activity Monitoring */}
          <div className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-semibold">Employee Activity Monitoring</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Observe real-time employee logs, detect potential misuse, and analyze threat patterns across the organization.
            </p>
            <button
              onClick={() => navigate("/Dashboard/liveMonitoringAnalytics")}
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-sm font-medium transition-colors duration-200"
            >
              View Live Activities
            </button>
          </div>

          {/* Local Credentials Security Logs */}
          <div className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <KeyRound className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold">Local Credentials Security Logs</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Detect suspicious login attempts, password tampering, or unauthorized credential changes within local systems.
            </p>
            <button
              onClick={() => navigate("/Dashboard/localCredentialsAnalytics")}
              className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 text-sm font-medium transition-colors duration-200"
            >
              View Logs
            </button>
          </div>

          {/* Shared Database Security Logs */}
          <div className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-semibold">Manipulate Shared DB</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
               Try manipulating the company's shared DB by writing sql queries. This will tell you how malicious code
            </p>
            <button
              onClick={() => alert('Redirecting to shared database logs...')}
              className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-sm font-medium transition-colors duration-200"
            >
              View Logs
            </button>
          </div>

          {/* Website Scaling Protection */}
          <div className="rounded-2xl border border-gray-800 bg-zinc-900 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Launch Scaling Protection</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Activate real-time security scaling. This feature dynamically adjusts protection during traffic spikes and new feature rollouts.
            </p>
            <button
              onClick={() => setServiceActive(!serviceActive)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                serviceActive
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {serviceActive ? 'Deactivate Service' : 'Activate Protection'}
            </button>

            {serviceActive && (
              <p className="mt-3 text-sm text-blue-400">
                Scaling Protection Active — Monitoring in real time...
              </p>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
