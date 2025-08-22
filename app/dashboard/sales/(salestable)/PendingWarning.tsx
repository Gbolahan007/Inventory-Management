interface PendingWarningProps {
  tableNumber: number;
  isDarkMode?: boolean;
}

export default function PendingWarning({
  tableNumber,
  isDarkMode = false,
}: PendingWarningProps) {
  return (
    <div
      className={`rounded-lg p-3 mb-4 ${
        isDarkMode
          ? "bg-yellow-900/20 border border-yellow-700/30"
          : "bg-yellow-50 border border-yellow-200"
      }`}
    >
      <p
        className={`text-sm ${
          isDarkMode ? "text-yellow-200" : "text-yellow-800"
        }`}
      >
        <strong>Bar Request Pending:</strong> Items have been sent to the bar
        for Table {tableNumber}. You cannot add or modify items until the
        bartender fulfills the order.
      </p>
    </div>
  );
}
