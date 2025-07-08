// components/ui/chart.tsx
import { cn } from "@/lib/utils";

export function ChartContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full h-[300px] rounded-xl overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
