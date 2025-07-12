import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useTotalInventory } from "../components/queryhooks/useTotalInventory";

export function LowStockAlert() {
  const { totalInventory } = useTotalInventory();
  const [showAll, setShowAll] = useState(false);

  const lowStockItems =
    totalInventory?.filter((item) => item.low_stock > item.current_stock) || [];
  const displayedItems = showAll ? lowStockItems : lowStockItems.slice(0, 4);
  const hasMoreItems = lowStockItems.length > 4;

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
          {displayedItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                  {item.name}
                </p>
              </div>
              <Badge variant="destructive" className="text-xs ml-2">
                {item.current_stock} left
              </Badge>
            </div>
          ))}

          {hasMoreItems && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  View Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  View More ({lowStockItems.length - 4} more)
                </>
              )}
            </button>
          )}

          {lowStockItems.length === 0 && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
              No low stock items
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
