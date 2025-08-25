import { CheckCircle, Clock, XCircle, Users } from "lucide-react";

interface BarRequest {
  id: string;
  table_id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  sales_rep_id: string;
  sales_rep_name: string;
  status: "pending" | "given" | "cancelled";
  created_at: string;
}

interface RequestsListProps {
  requests: BarRequest[];
  isUpdating: boolean;
  updateRequestStatus: (
    requestId: string,
    newStatus: "given" | "cancelled"
  ) => void;
  markTableAsGiven: (tableId: number) => void;
}

export default function RequestsList({
  requests,
  isUpdating,
  updateRequestStatus,
  markTableAsGiven,
}: RequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-8 text-center">
        <div className="text-4xl mb-4">🍺</div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No requests found
        </h3>
        <p className="text-muted-foreground">
          No bar requests match your current filters.
        </p>
      </div>
    );
  }

  // Group requests by table
  const requestsByTable = requests.reduce((acc, request) => {
    if (!acc[request.table_id]) {
      acc[request.table_id] = [];
    }
    acc[request.table_id].push(request);
    return acc;
  }, {} as Record<number, BarRequest[]>);

  // Sort tables by ID
  const sortedTables = Object.keys(requestsByTable)
    .map(Number)
    .sort((a, b) => a - b);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "given":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case "given":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  return (
    <div className="space-y-6">
      {sortedTables.map((tableId) => {
        const tableRequests = requestsByTable[tableId];
        const pendingRequests = tableRequests.filter(
          (r) => r.status === "pending"
        );
        const hasPendingRequests = pendingRequests.length > 0;

        return (
          <div
            key={tableId}
            className="bg-card rounded-lg border overflow-hidden"
          >
            {/* Table Header with Mark All Button at Top */}
            <div className="bg-muted/50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Table {tableId}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{tableRequests.length} total items</span>
                    {hasPendingRequests && (
                      <span className="text-orange-600">
                        • {pendingRequests.length} pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Mark All Button - Positioned at the top */}
                {hasPendingRequests && (
                  <button
                    onClick={() => markTableAsGiven(tableId)}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark All Ready ({pendingRequests.length})
                  </button>
                )}
              </div>
            </div>

            {/* Requests List */}
            <div className="divide-y divide-border">
              {tableRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(request.status)}
                        <h4 className="text-base font-medium text-foreground truncate">
                          {request.product_name}
                        </h4>
                        <span className={getStatusBadge(request.status)}>
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Qty:</span>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                            {request.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Rep:</span>
                          <span>{request.sales_rep_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Time:</span>
                          <span>
                            {new Date(request.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Individual Action Buttons */}
                    {request.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() =>
                            updateRequestStatus(request.id, "given")
                          }
                          disabled={isUpdating}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Ready
                        </button>
                        <button
                          onClick={() =>
                            updateRequestStatus(request.id, "cancelled")
                          }
                          disabled={isUpdating}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
