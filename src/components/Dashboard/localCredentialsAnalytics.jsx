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

  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true
    });

    setSocket(newSocket);
    newSocket.on("connect", () => {
      console.log("Socket.IO connected!", newSocket.id);
      newSocket.emit("request_blockchain");
    });

    newSocket.on("connection_response", (data) => {
      console.log("Connection response:", data);
    });

    newSocket.on("blockchain_data", (data) => {
      console.log("Blockchain data received:", data);
      if (data.chain && data.chain.length > 1) {
        const allAlerts = [];
        data.chain.slice(1).forEach(block => {
          if (block.data && Array.isArray(block.data)) {
            allAlerts.push(...block.data);
          }
        });
        if (allAlerts.length > 0) {
          setAlerts(allAlerts.slice(0, 200));
          const total = allAlerts.length;
          const high = allAlerts.filter(a => a.rule_score >= 0.8).length;
          const external = allAlerts.filter(a => a.features?.is_external_ip).length;
          const avg_score = allAlerts.reduce((sum, a) => sum + (a.rule_score || 0), 0) / total;
          setStats({ total, high, external, avg_score });
        }
      }
    });

    newSocket.on("blockchain_update", (data) => {
      console.log("New blockchain block:", data);
    });

    newSocket.on("new_alert", (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 200));
      setStats((prev) => {
        const total = prev.total + 1;
        const high = prev.high + (alert.rule_score >= 0.8 ? 1 : 0);
        const external =
          prev.external +
          (alert.features && alert.features.is_external_ip ? 1 : 0);
        const avg_score =
          (prev.avg_score * prev.total + (alert.rule_score || 0)) / total;
        return { total, high, external, avg_score };
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket.IO disconnected!");
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });
    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("blockchain_update");
        newSocket.off("new_alert");
        newSocket.off("disconnect");
        newSocket.off("error");
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Real-time Insights
        </h1>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="text-sm text-gray-500">
            {socket?.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </header>

      <StatsCards stats={stats} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AlertsList alerts={alerts} onSelect={setSelected} />
        </div>

        <div className="lg:col-span-2">
          <AlertDetail alert={selected} />
        </div>
      </div>
    </div>
  );
}