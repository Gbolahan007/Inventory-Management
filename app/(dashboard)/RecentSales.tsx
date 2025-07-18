"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { useRecentSales } from "../components/queryhooks/useRecentSales";
import { FormatCurrency } from "../hooks/useFormatCurrency";
import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  format,
  parseISO,
  compareDesc,
} from "date-fns";

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

  // Filter and sort recent sales by date
  const getFilteredSales = () => {
    if (!recentSales) return [];

    // Parse dates and sort by most recent first
    const salesWithParsedDates = recentSales?.map((sale) => ({
      ...sale,
      parsedDate: parseISO(sale.created_at),
    }));

    // Sort by date (most recent first)
    const sortedSales = salesWithParsedDates.sort((a, b) =>
      compareDesc(a.parsedDate, b.parsedDate)
    );

    // Filter for recent sales (last 30 days for example)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return sortedSales.filter((sale) => sale.parsedDate >= thirtyDaysAgo);
  };

  // Get date label for grouping
  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else if (isThisWeek(date)) {
      return format(date, "EEEE"); // Day of week
    } else if (isThisMonth(date)) {
      return format(date, "MMM d"); // Month and day
    } else {
      return format(date, "MMM d, yyyy"); // Full date
    }
  };

  // Group sales by date
  const groupSalesByDate = (sales: RecentSale[]) => {
    const grouped: { [key: string]: RecentSale[] } = {};

    sales.forEach((sale) => {
      const dateLabel = getDateLabel(sale.created_at);
      if (!grouped[dateLabel]) {
        grouped[dateLabel] = [];
      }
      grouped[dateLabel].push(sale);
    });

    return grouped;
  };

  const filteredSales = getFilteredSales().slice(0, 7);
  const groupedSales = groupSalesByDate(filteredSales);

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Recent Sales
          <Badge variant="outline" className="ml-auto text-xs">
            {filteredSales.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {Object.keys(groupedSales).length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No recent sales found
              </p>
            </div>
          ) : (
            Object.entries(groupedSales).map(([dateLabel, sales]) => (
              <div key={dateLabel} className="space-y-2">
                {/* Date Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-muted">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {dateLabel}
                  </h3>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {sales.length}
                  </Badge>
                </div>

                {/* Sales for this date */}
                <div className="space-y-3">
                  {sales.slice(0, 7).map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between pl-5"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                          {sale.payment_method}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(sale.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-xs sm:text-sm font-medium text-primary">
                          {FormatCurrency(sale.total_amount)}
                        </div>
                        <Badge
                          variant={getStatusColor(sale.status)}
                          className="text-xs mt-1"
                        >
                          {sale.status ?? "completed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
