import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  borderColor?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  borderColor = "border-l-primary/20 hover:border-l-primary",
}: MetricCardProps) {
  return (
    <Card
      className={`col-span-1 group hover:shadow-lg transition-all duration-300 border-l-4 ${borderColor}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl sm:text-3xl font-bold text-foreground mb-1">
          {value}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${
              trend.isPositive
                ? "text-primary bg-primary/10"
                : "text-destructive bg-destructive/10"
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 ${!trend.isPositive ? "rotate-180" : ""}`}
            />
            {trend.value}
          </span>
          {trend.label}
        </div>
      </CardContent>
    </Card>
  );
}
