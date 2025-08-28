/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>({});

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow =
      process.env.NODE_ENV === "development" ||
      localStorage.getItem("enableDebugPanel") === "true";
    setIsVisible(shouldShow);

    if (shouldShow) {
      // Load logs from sessionStorage
      const loadLogs = () => {
        try {
          const storedLogs = JSON.parse(
            sessionStorage.getItem("debugLogs") || "[]"
          );
          setLogs(storedLogs);
        } catch {}
      };

      loadLogs();
      const interval = setInterval(loadLogs, 2000); // Refresh every 2 seconds

      // Collect system info
      setSystemInfo({
        userAgent: navigator.userAgent,
        url: window.location.href,
        online: navigator.onLine,
        timestamp: new Date().toISOString(),
      });

      return () => clearInterval(interval);
    }
  }, []);

  const downloadLogs = () => {
    const data = { logs, systemInfo, exportTime: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    sessionStorage.removeItem("debugLogs");
    setLogs([]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white border rounded shadow-lg">
      <div className="p-3 bg-gray-100 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium text-sm">Debug Panel</span>
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
            {logs.length}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={downloadLogs}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clearLogs} className="p-1 hover:bg-gray-200 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto p-2">
        {logs
          .slice(-20)
          .reverse()
          .map((log, index) => (
            <div key={index} className="mb-2 p-2 text-xs border rounded">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.type === "error"
                      ? "bg-red-500"
                      : log.type === "warning"
                      ? "bg-orange-500"
                      : log.type === "success"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                ></span>
                <span className="font-medium">{log.message}</span>
              </div>
              {log.data && (
                <pre className="mt-1 text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                  {JSON.stringify(log.data, null, 2).substring(0, 200)}...
                </pre>
              )}
              <div className="text-gray-500 text-xs mt-1">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        {logs.length === 0 && (
          <div className="text-center text-gray-500 py-4">No logs yet</div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
