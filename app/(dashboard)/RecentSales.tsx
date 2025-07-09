import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const recentSales = [
  {
    id: "#12345",
    customer: "John Doe",
    amount: "$299.00",
    status: "Completed",
    time: "2 min ago",
  },
  {
    id: "#12346",
    customer: "Jane Smith",
    amount: "$159.00",
    status: "Processing",
    time: "5 min ago",
  },
  {
    id: "#12347",
    customer: "Mike Johnson",
    amount: "$89.00",
    status: "Completed",
    time: "8 min ago",
  },
  {
    id: "#12348",
    customer: "Sarah Wilson",
    amount: "$199.00",
    status: "Completed",
    time: "12 min ago",
  },
  {
    id: "#12349",
    customer: "Tom Brown",
    amount: "$349.00",
    status: "Pending",
    time: "15 min ago",
  },
];

export function RecentSales() {
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
          {recentSales.slice(0, 4).map((sale) => (
            <div key={sale.id} className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                  {sale.customer}
                </p>
                <p className="text-xs text-muted-foreground">{sale.time}</p>
              </div>
              <div className="text-right ml-2">
                <div className="text-xs sm:text-sm font-medium text-primary">
                  {sale.amount}
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
                  {sale.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
