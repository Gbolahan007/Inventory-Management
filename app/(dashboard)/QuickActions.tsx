import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="sm:hidden">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-transparent"
            >
              Add Product
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-transparent"
            >
              View Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-transparent"
            >
              Manage Orders
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-transparent"
            >
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
