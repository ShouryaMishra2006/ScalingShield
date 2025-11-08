export default function AlertsList({ alerts, onSelect }) {

  // Helper function: show true flags or Safe
  const displayFlags = (alert) => {
    if (!alert.flags) return "Safe";
    
    const activeFlags = Object.entries(alert.flags)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    return activeFlags.length > 0 ? activeFlags.join(", ") : "Safe";
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        const flagsText = displayFlags(alert);
        const timestamp = alert.features?.timestamp
          ? new Date(alert.features.timestamp).toLocaleString()
          : "Unknown Time";

        return (
          <div
            key={index}
            className={`p-2 border rounded cursor-pointer flex justify-between items-center
              ${flagsText !== "Safe" ? 'bg-red-100 bg-red-100' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => onSelect(alert)}
            title={alert.features?.command_line}
          >
            <span className="truncate">{flagsText}</span>
            <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">{timestamp}</span>
          </div>
        );
      })}
    </div>
  );
}
