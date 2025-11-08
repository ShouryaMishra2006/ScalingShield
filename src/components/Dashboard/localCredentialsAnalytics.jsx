import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import StatsCards from "./StatsCards";
import AlertsList from "./AlertsList";
import AlertDetail from "./AlertDetail";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    external: 0,
    avg_score: 0,
  });
  const [socket, setSocket] = useState(null);

  // --- Helper: Extract flags that are true ---
  const getActiveFlags = (alert) => {
    if (!alert.flags) return [];
    return Object.entries(alert.flags)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
  };

  // --- Helper: Handle incoming alerts ---
  const handleIncomingAlerts = (newAlerts) => {
    if (!newAlerts || newAlerts.length === 0) return;

    setAlerts((prevAlerts) => {
      const updatedAlerts = [...newAlerts, ...prevAlerts].slice(0, 200);

      setStats((prevStats) => {
        const total = prevStats.total + newAlerts.length;
        const high = prevStats.high + newAlerts.filter(a => a.rule_score >= 0.8).length;
        const external = prevStats.external + newAlerts.filter(a => a.features?.is_external_ip).length;
        const avg_score =
          (prevStats.avg_score * prevStats.total + newAlerts.reduce((sum, a) => sum + (a.rule_score || 0), 0)) / total;

        return { total, high, external, avg_score };
      });

      return updatedAlerts;
    });
  };

  // --- Socket.IO setup ---
  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket.IO connected!", newSocket.id);
      newSocket.emit("request_blockchain");
    });

    newSocket.on("blockchain_data", (data) => {
      console.log("Blockchain data received:", data);
      if (data.chain && data.chain.length > 1) {
        const allAlerts = [];
        data.chain.slice(1).forEach((block) => {
          if (block.data && Array.isArray(block.data)) {
            allAlerts.push(...block.data);
          }
        });
        handleIncomingAlerts(allAlerts.slice(0, 200));
      }
    });

    newSocket.on("blockchain_update", (block) => {
      console.log("New blockchain block:", block);
      if (block.logs && block.logs.length > 0) {
        handleIncomingAlerts(block.logs);
      }
    });

    newSocket.on("new_alert", (alert) => {
      handleIncomingAlerts([alert]);
    });

    newSocket.on("disconnect", () => console.log("Socket.IO disconnected!"));
    newSocket.on("error", (error) => console.error("Socket error:", error));

    return () => {
      newSocket.off("connect");
      newSocket.off("blockchain_data");
      newSocket.off("blockchain_update");
      newSocket.off("new_alert");
      newSocket.off("disconnect");
      newSocket.off("error");
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Real-time Insights
        </h1>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              socket?.connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <div className="text-sm text-gray-500">
            {socket?.connected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </header>

      <StatsCards stats={stats} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
        <div className="lg:col-span-1 overflow-y-auto">
          <AlertsList alerts={alerts} onSelect={setSelected} getActiveFlags={getActiveFlags} />
        </div>

        <div className="lg:col-span-2 overflow-y-auto">
          <AlertDetail alert={selected} getActiveFlags={getActiveFlags} />
        </div>
      </div>
    </div>
  );
}
