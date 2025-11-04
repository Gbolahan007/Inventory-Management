import type { LucideIcon } from "lucide-react";

interface SalesSummaryCardProps {
  title: string;
  amount: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  isLarge?: boolean;
}

export function SalesSummaryCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconClass,
  isLarge = false,
}: SalesSummaryCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 ${
        isLarge
          ? "bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-900 border-0"
          : "border border-slate-200 dark:border-slate-700"
      } hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`${
            isLarge ? "text-white" : "text-slate-900 dark:text-white"
          } text-base sm:text-lg font-semibold`}
        >
          {title}
        </h2>
        <div className={`p-3 rounded-lg ${iconBgClass}`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconClass}`} />
        </div>
      </div>
      <p
        className={`text-2xl sm:text-3xl font-bold ${
          isLarge ? "text-white" : "text-slate-900 dark:text-white"
        } mb-2`}
      >
        {amount}
      </p>
      <p
        className={`text-xs sm:text-sm ${
          isLarge ? "text-slate-200" : "text-slate-600 dark:text-slate-400"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}
