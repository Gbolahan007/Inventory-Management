import { Clock, CheckCircle, XCircle, Package } from "lucide-react";
import type { BarRequest } from "../(sales)/types";

interface Props {
  barRequests: BarRequest[];
}

export default function BarStatsCards({ barRequests }: Props) {
  const counts = {
    all: barRequests.length,
    pending: barRequests.filter((r) => r.status === "pending").length,
    given: barRequests.filter((r) => r.status === "given").length,
  };

  const cards = [
    { label: "Total", value: counts.all, icon: Package, color: "text-primary" },
    {
      label: "Pending",
      value: counts.pending,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Given",
      value: counts.given,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Cancelled",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-card rounded-lg shadow border p-4">
          <div className="flex items-center">
            <Icon className={`h-6 w-6 ${color}`} />
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">
                {label}
              </p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
