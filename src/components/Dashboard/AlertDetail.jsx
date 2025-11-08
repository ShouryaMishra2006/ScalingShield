import React, { useState } from "react";

export default function AlertDetail({ alert }){
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  if(!alert) return (
    <div className="bg-white rounded-xl shadow p-6 h-[72vh] flex items-center justify-center text-gray-400">
      Select an alert to see details
    </div>
  );

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/explain_alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert)
      });
      const data = await res.json();
      if(data.ok && data.explanation){
        setExplanation(data.explanation);
      } else if(data.explanation){
        setExplanation(data.explanation);
      } else {
        setExplanation(data.error || "No explanation available");
      }
    } catch(err){
      setExplanation("Error fetching explanation: "+err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-h-[72vh] overflow-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{alert.summary}</h2>
          <div className="text-sm text-gray-500 mt-1">Score: <span className="font-mono">{(alert.score||0).toFixed(2)}</span></div>
        </div>
        <div className="space-x-2">
          <button onClick={fetchExplanation} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
            {loading ? "Thinking..." : "Get Explanation"}
          </button>
        </div>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Evidence</h4>
          <pre className="text-xs bg-gray-50 p-3 rounded">{JSON.stringify(alert.evidence, null, 2)}</pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Components (scores)</h4>
          <ul className="text-sm">
            {alert.components && Object.entries(alert.components).map(([k,v]) => (
              <li key={k} className="flex justify-between py-1 border-b">
                <span className="capitalize">{k}</span>
                <span className="font-mono">{typeof v === 'number' ? v.toFixed(3) : String(v)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-4">
        <h4 className="font-semibold mb-2">Blockchain Anchor</h4>
        {alert.blockchain_tx ? (
          <div className="text-sm bg-gray-50 p-3 rounded">{alert.blockchain_tx}</div>
        ) : (
          <div className="text-xs text-gray-500">No on-chain anchor for this alert</div>
        )}
      </section>

      <section className="mt-4">
        <h4 className="font-semibold mb-2">LLM Explanation</h4>
        <div className="bg-gray-50 p-3 rounded min-h-[120px] text-sm">
          {explanation ? explanation : <span className="text-gray-400">Explanation not fetched. Click &quot;Get Explanation&quot; to call the RAG endpoint.</span>}
        </div>
      </section>

      <section className="mt-4 flex gap-2">
        <button className="px-3 py-1 rounded bg-red-600 text-white text-sm">Isolate Host</button>
        <button className="px-3 py-1 rounded bg-amber-500 text-white text-sm">Notify IT</button>
      </section>
    </div>
  );
}
