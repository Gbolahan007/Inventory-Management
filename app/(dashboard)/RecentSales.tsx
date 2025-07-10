"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useRecentSales } from "../components/queryhooks/useRecentSales";
import { FormatCurrency } from "../hooks/useFormatCurrency";
import { formatDistanceToNow } from "date-fns";

// Define the sale type
type RecentSale = {
  id: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  status?: "Completed" | "Processing" | "Pending";
};

export function RecentSales() {
  const { recentSales }: { recentSales?: RecentSale[] } = useRecentSales();

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Recent Sales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {(recentSales ?? []).slice(0, 4).map((sale) => (
            <div key={sale.id} className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                  {sale.payment_method}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(sale.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div className="text-right ml-2">
                <div className="text-xs sm:text-sm font-medium text-primary">
                  {FormatCurrency(sale.total_amount)}
                </div>
                <Badge
                  variant={
                    sale.status === "Completed"
                      ? "default"
                      : sale.status === "Processing"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-xs mt-1"
                >
                  {sale.status ?? "completed"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
