import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

const lowStockItems = [
  { name: "iPhone Cases", stock: 5, threshold: 20 },
  { name: "Bluetooth Speakers", stock: 8, threshold: 25 },
  { name: "Power Banks", stock: 12, threshold: 30 },
];

export function LowStockAlert() {
  return (
    <Card className="lg:col-span-1 border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          Low Stock Alert
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Items that need restocking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {lowStockItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Threshold: {item.threshold} units
                </p>
              </div>
              <Badge variant="destructive" className="text-xs ml-2">
                {item.stock} left
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
