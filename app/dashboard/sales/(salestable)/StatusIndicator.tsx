import { Clock, CheckCircle, Send } from "lucide-react";

interface StatusIndicatorProps {
  status: "none" | "pending" | "given";
  isDarkMode: boolean;
}

export function StatusIndicator({ status, isDarkMode }: StatusIndicatorProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          text: "Bar Request Pending",
        };
      case "given":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-50",
          text: "Ready for Payment",
        };
      default:
        return {
          icon: Send,
          color: "text-blue-600",
          bg: "bg-blue-50",
          text: "Ready to Send",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg ${config.bg} ${
        isDarkMode ? "bg-opacity-20" : ""
      }`}
    >
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
}
