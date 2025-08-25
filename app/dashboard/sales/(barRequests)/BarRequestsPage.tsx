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

  const {
    setTableBarRequestStatus,
    moveSpecificItemsToApproved,
    moveItemsToApproved,
  } = useTableCartStore();

  const [filter, setFilter] = useState<
    "all" | "pending" | "given" | "cancelled"
  >("all");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const requests = barRequests || [];

  // Enhanced filtering logic
  const filteredRequests = requests.filter((request: BarRequest) => {
    const statusMatch = filter === "all" || request.status === filter;
    const tableMatch =
      selectedTable === null || request.table_id === selectedTable;
    const salesRepMatch =
      selectedSalesRep === null || request.sales_rep_id === selectedSalesRep;

    // Date filtering - check if request date matches selected date
    const dateMatch =
      !selectedDate ||
      new Date(request.created_at).toDateString() ===
        new Date(selectedDate).toDateString();

    return statusMatch && tableMatch && salesRepMatch && dateMatch;
  });

  const uniqueTables = [
    ...new Set(requests.map((r: BarRequest) => r.table_id)),
  ].sort();

  const uniqueSalesReps = Array.from(
    new Map(
      requests.map((r: BarRequest) => [
        r.sales_rep_id,
        {
          id: r.sales_rep_id,
          name: r.sales_rep_name,
        },
      ])
    ).values()
  ).sort((a, b) => a.name?.localeCompare(b.name));

  // Get unique dates for filtering
  const uniqueDates = [
    ...new Set(
      requests.map((r: BarRequest) => new Date(r.created_at).toDateString())
    ),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Most recent first

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

  // Clear all filters
  const clearFilters = () => {
    setFilter("all");
    setSelectedTable(null);
    setSelectedSalesRep(null);
    setSelectedDate("");
  };

  // ENHANCED: Update individual request and approve specific cart items
  const handleUpdateRequestStatus = (
    requestId: string,
    newStatus: "given" | "cancelled"
  ) => {
    // Find the request to get the table_id and item details
    const request = requests.find((r: BarRequest) => r.id === requestId);

    if (!request) {
      toast.error("Request not found");
      return;
    }

    updateRequest(
      { requestId, newStatus },
      {
        onSuccess: () => {
          if (newStatus === "given") {
            // CRITICAL: Approve the specific item in the cart
            if (moveSpecificItemsToApproved) {
              moveSpecificItemsToApproved(request.table_id, [
                {
                  product_id: request.product_id,
                  quantity: request.quantity,
                },
              ]);
            }

            // Update table status
            const otherPendingRequests = requests.filter(
              (r: BarRequest) =>
                r.table_id === request.table_id &&
                r.status === "pending" &&
                r.id !== requestId
            );

            const tableStatus =
              otherPendingRequests.length === 0 ? "given" : "none";
            setTableBarRequestStatus(request.table_id, tableStatus);

            toast.success(
              `Request approved! Item marked as ready in Table ${request.table_id} cart.`
            );
          } else if (newStatus === "cancelled") {
            // Handle cancelled requests - remove from cart or keep as pending
            const remainingPendingRequests = requests.filter(
              (r: BarRequest) =>
                r.table_id === request.table_id &&
                r.status === "pending" &&
                r.id !== requestId
            );

            const tableStatus =
              remainingPendingRequests.length === 0 ? "none" : "pending";
            setTableBarRequestStatus(request.table_id, tableStatus);

            toast.success(`Request cancelled for Table ${request.table_id}.`);
          }
        },
        onError: () => {
          toast.error("Failed to update request status. Please try again.");
        },
      }
    );
  };

  // ENHANCED: Mark entire table as given and approve ALL pending items
  const handleMarkTableAsGiven = (tableId: number) => {
    // Only consider filtered pending requests for this table
    const tablePendingRequests = filteredRequests.filter(
      (r: BarRequest) => r.table_id === tableId && r.status === "pending"
    );

    const requestIds = tablePendingRequests.map((request) => request.id);

    if (requestIds.length === 0) {
      toast.error(
        `No pending requests found for table ${tableId} with current filters`
      );
      return;
    }

    updateMultipleRequests(
      { requestIds, newStatus: "given" },
      {
        onSuccess: () => {
          // CRITICAL: Approve ALL pending items for this table in the cart
          if (moveSpecificItemsToApproved) {
            const itemsToApprove = tablePendingRequests.map((request) => ({
              product_id: request.product_id,
              quantity: request.quantity,
            }));

            moveSpecificItemsToApproved(tableId, itemsToApprove);
          } else if (moveItemsToApproved) {
            // Fallback: approve all pending items
            moveItemsToApproved(tableId);
          }

          // Update table status
          setTableBarRequestStatus(tableId, "given");

          toast.success(
            `Table ${tableId} processed! ${requestIds.length} items approved in cart.`
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
      all: filteredRequests.length,
      pending: filteredRequests.filter(
        (r: BarRequest) => r.status === "pending"
      ).length,
      given: filteredRequests.filter((r: BarRequest) => r.status === "given")
        .length,
      cancelled: filteredRequests.filter(
        (r: BarRequest) => r.status === "cancelled"
      ).length,
    };
  };

  // Check if any mutation is in progress
  const isUpdating = isUpdatingRequest || isUpdatingMultiple;

  // Check if filters are active
  const hasActiveFilters =
    filter !== "all" ||
    selectedTable !== null ||
    selectedSalesRep !== null ||
    selectedDate !== "";

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
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    Filtered
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              )}
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
        </div>

        <BarStatsCards counts={getRequestCounts()} />

        <FiltersSection
          filter={filter}
          setFilter={setFilter}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          selectedSalesRep={selectedSalesRep}
          setSelectedSalesRep={setSelectedSalesRep}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          uniqueTables={uniqueTables}
          uniqueSalesReps={uniqueSalesReps}
          uniqueDates={uniqueDates}
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
