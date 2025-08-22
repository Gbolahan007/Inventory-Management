import { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Hash,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  ) => Promise<void>;
  markTableAsGiven: (tableId: number) => Promise<void>;
}

export default function RequestsList({
  requests,
  isUpdating,
  updateRequestStatus,
  markTableAsGiven,
}: RequestsListProps) {
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());

  const groupedRequests = requests.reduce(
    (groups: Record<number, BarRequest[]>, request: BarRequest) => {
      const key = request.table_id;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(request);
      return groups;
    },
    {} as Record<number, BarRequest[]>
  );

  const toggleTableExpansion = (tableId: number) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableId)) {
      newExpanded.delete(tableId);
    } else {
      newExpanded.add(tableId);
    }
    setExpandedTables(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />;
      case "given":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "given":
        return "bg-green-50 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {Object.keys(groupedRequests).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
          <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No requests found
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            No bar requests match your current filters.
          </p>
        </div>
      ) : (
        Object.entries(groupedRequests).map(([tableId, tableRequests]) => (
          <div
            key={tableId}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Table Header */}
            <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleTableExpansion(Number(tableId))}
                  className="flex items-center gap-2 sm:gap-3 flex-1 text-left min-h-[44px]"
                >
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      Table {tableId}
                    </h2>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm w-fit">
                      {tableRequests.length} items
                    </span>
                  </div>
                  <div className="ml-auto flex-shrink-0 sm:hidden">
                    {expandedTables.has(Number(tableId)) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Quick Actions - Desktop */}
                {tableRequests.some((r) => r.status === "pending") && (
                  <button
                    onClick={() => markTableAsGiven(Number(tableId))}
                    disabled={isUpdating}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 lg:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm min-h-[44px]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="hidden lg:inline">Mark All as Given</span>
                    <span className="lg:hidden">Mark All</span>
                  </button>
                )}
              </div>

              {/* Quick Actions - Mobile */}
              {tableRequests.some((r) => r.status === "pending") && (
                <div className="mt-3 sm:hidden">
                  <button
                    onClick={() => markTableAsGiven(Number(tableId))}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm min-h-[44px]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark All as Given
                  </button>
                </div>
              )}
            </div>

            {/* Request Items */}
            <div
              className={`divide-y divide-gray-100 ${
                expandedTables.has(Number(tableId)) || "hidden sm:block"
              }`}
            >
              {tableRequests.map((request) => (
                <div
                  key={request.id}
                  className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6"
                >
                  <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 sm:mb-0">
                          {request.product_name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">
                            {request.status}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Qty: {request.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {request.sales_rep_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{formatTime(request.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {request.status === "pending" && (
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <button
                          onClick={() =>
                            updateRequestStatus(request.id, "given")
                          }
                          disabled={isUpdating}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50 transition-colors min-h-[40px]"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sm:hidden">Given</span>
                          <span className="hidden sm:inline">
                            Mark as Given
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            updateRequestStatus(request.id, "cancelled")
                          }
                          disabled={isUpdating}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700 disabled:opacity-50 transition-colors min-h-[40px]"
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
