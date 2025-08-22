import { useBarRequestsQuery } from "@/app/components/queryhooks/useBarRequestsQuery";
import { RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import BarStatsCards from "./BarStatsCards";
import FiltersSection from "./FiltersSection";
import RequestsList from "./RequestsList";
import { useUpdateRequestStatus } from "@/app/components/queryhooks/useUpdateRequestStatus";
import { useUpdateMultipleRequestsStatus } from "@/app/components/queryhooks/useUpdateMultipleRequestsStatus";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";

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

export default function BarRequestsPage() {
  const { barRequests, isLoading, error, refetch } = useBarRequestsQuery();

  const { mutate: updateRequest, isPending: isUpdatingRequest } =
    useUpdateRequestStatus();
  const { mutate: updateMultipleRequests, isPending: isUpdatingMultiple } =
    useUpdateMultipleRequestsStatus();

  const { setTableBarRequestStatus } = useTableCartStore();

  const [filter, setFilter] = useState<
    "all" | "pending" | "given" | "cancelled"
  >("all");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const requests = barRequests || [];

  const filteredRequests = requests.filter((request: BarRequest) => {
    const statusMatch = filter === "all" || request.status === filter;
    const tableMatch =
      selectedTable === null || request.table_id === selectedTable;
    return statusMatch && tableMatch;
  });

  const uniqueTables = [
    ...new Set(requests.map((r: BarRequest) => r.table_id)),
  ].sort();

  // Handle refresh functionality
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Bar requests refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data. Please try again.");
      console.log(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Updated to sync with Zustand store and simplified with query invalidation
  const handleUpdateRequestStatus = (
    requestId: string,
    newStatus: "given" | "cancelled"
  ) => {
    // Find the request to get the table_id
    const request = requests.find((r: BarRequest) => r.id === requestId);

    if (!request) {
      toast.error("Request not found");
      return;
    }

    updateRequest(
      { requestId, newStatus },
      {
        onSuccess: () => {
          // Update the Zustand store based on the new status
          if (newStatus === "given") {
            // Check if this was the last pending request for this table
            const otherPendingRequests = requests.filter(
              (r: BarRequest) =>
                r.table_id === request.table_id &&
                r.status === "pending" &&
                r.id !== requestId
            );

            // If no other pending requests, mark table as "given", otherwise keep as "pending"
            const tableStatus =
              otherPendingRequests.length === 0 ? "given" : "pending";
            setTableBarRequestStatus(request.table_id, tableStatus);
          } else if (newStatus === "cancelled") {
            // Check if there are any remaining pending requests for this table
            const remainingPendingRequests = requests.filter(
              (r: BarRequest) =>
                r.table_id === request.table_id &&
                r.status === "pending" &&
                r.id !== requestId
            );

            // If no pending requests left, set to "none", otherwise keep as "pending"
            const tableStatus =
              remainingPendingRequests.length === 0 ? "none" : "pending";
            setTableBarRequestStatus(request.table_id, tableStatus);
          }

          toast.success(`Request marked as ${newStatus}!`);
        },
        onError: () => {
          toast.error("Failed to update request status. Please try again.");
        },
      }
    );
  };

  // Updated to sync with Zustand store and simplified with query invalidation
  const handleMarkTableAsGiven = (tableId: number) => {
    const tablePendingRequests = requests.filter(
      (r: BarRequest) => r.table_id === tableId && r.status === "pending"
    );

    const requestIds = tablePendingRequests.map((request) => request.id);

    if (requestIds.length === 0) {
      toast.error(`No pending requests found for table ${tableId}`);
      return;
    }

    updateMultipleRequests(
      { requestIds, newStatus: "given" },
      {
        onSuccess: () => {
          setTableBarRequestStatus(tableId, "given");
          toast.success(
            `Table ${tableId} marked as served! (${requestIds.length} items)`
          );
        },
        onError: () => {
          toast.error(`Failed to update table ${tableId}. Please try again.`);
        },
      }
    );
  };

  const getRequestCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter((r: BarRequest) => r.status === "pending")
        .length,
      given: requests.filter((r: BarRequest) => r.status === "given").length,
      cancelled: requests.filter((r: BarRequest) => r.status === "cancelled")
        .length,
    };
  };

  // Check if any mutation is in progress
  const isUpdating = isUpdatingRequest || isUpdatingMultiple;

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bar requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <XCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">
            Failed to load bar requests
          </p>
          <p className="text-muted-foreground mb-4 text-sm">
            Please try refreshing the page.
          </p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
          >
            <RefreshCw
              className={`w-4 h-4 inline mr-2 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Bar Requests
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage drink orders from sales representatives
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm sm:text-base min-h-[44px]"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isRefreshing || isLoading ? "animate-spin" : ""
                }`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <BarStatsCards counts={getRequestCounts()} />

        <FiltersSection
          filter={filter}
          setFilter={setFilter}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          uniqueTables={uniqueTables}
          counts={getRequestCounts()}
        />

        <RequestsList
          requests={filteredRequests}
          isUpdating={isUpdating}
          updateRequestStatus={handleUpdateRequestStatus}
          markTableAsGiven={handleMarkTableAsGiven}
        />
      </div>
    </div>
  );
}
