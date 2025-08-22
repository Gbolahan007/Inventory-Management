interface TableStatusIndicatorProps {
  status: string;
  className?: string;
}

export default function TableStatusIndicator({
  status,
  className = "",
}: TableStatusIndicatorProps) {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return {
          text: "Bar Request Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          dotColor: "bg-yellow-400",
        };
      case "given":
        return {
          text: "Ready for Payment",
          color: "bg-green-100 text-green-800 border-green-300",
          dotColor: "bg-green-400",
        };
      default:
        return {
          text: "Ready to Send",
          color: "bg-blue-100 text-blue-800 border-blue-300",
          dotColor: "bg-blue-400",
        };
    }
  };

  const statusInfo = getStatusDisplay(status);

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color} ${className}`}
    >
      {statusInfo.text}
    </div>
  );
}
