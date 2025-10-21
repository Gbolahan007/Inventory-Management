import type React from "react";
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "green" | "yellow" | "red" | "blue";
}

export default function BarApprovalSummaryCard({
  title,
  value,
  icon,
  color,
}: SummaryCardProps) {
  const colorClasses = {
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    yellow:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };

  return (
    <div
      className={`rounded-lg p-3 sm:p-4 border ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {icon}
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-80 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
