import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  User,
  X,
} from "lucide-react";

interface FiltersProps {
  filter: "all" | "pending" | "given" | "cancelled";
  setFilter: (filter: "all" | "pending" | "given" | "cancelled") => void;
  selectedTable: number | null;
  setSelectedTable: (table: number | null) => void;
  selectedSalesRep: string | null;
  setSelectedSalesRep: (repId: string | null) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  uniqueTables: number[];
  uniqueSalesReps: { id: string; name: string }[];
  uniqueDates: string[];
  counts: {
    all: number;
    pending: number;
    given: number;
    cancelled: number;
  };
}

export default function FiltersSection({
  filter,
  setFilter,
  selectedTable,
  setSelectedTable,
  selectedSalesRep,
  setSelectedSalesRep,
  selectedDate,
  setSelectedDate,
  uniqueTables,
  uniqueSalesReps,
  uniqueDates,
  counts,
}: FiltersProps) {
  const statusFilters = [
    { key: "all", label: "All", icon: null, count: counts.all },
    {
      key: "pending",
      label: "Pending",
      icon: <Clock className="w-4 h-4" />,
      count: counts.pending,
    },
    {
      key: "given",
      label: "Ready",
      icon: <CheckCircle className="w-4 h-4" />,
      count: counts.given,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      icon: <XCircle className="w-4 h-4" />,
      count: counts.cancelled,
    },
  ] as const;

  const formatDateOption = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filter !== "all") count++;
    if (selectedTable !== null) count++;
    if (selectedSalesRep !== null) count++;
    if (selectedDate !== "") count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilter("all");
    setSelectedTable(null);
    setSelectedSalesRep(null);
    setSelectedDate("");
  };

  return (
    <div className="mb-6">
      <div className="bg-card rounded-lg border p-4">
        {/* Status Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((statusFilter) => (
              <button
                key={statusFilter.key}
                onClick={() => setFilter(statusFilter.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                  filter === statusFilter.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {statusFilter.icon}
                <span>{statusFilter.label}</span>
                <span className="px-1.5 py-0.5 bg-black/20 text-xs rounded">
                  {statusFilter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <div className="relative">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                >
                  <option value="">All dates</option>
                  {uniqueDates.map((date) => (
                    <option
                      key={date}
                      value={new Date(date).toISOString().split("T")[0]}
                    >
                      {formatDateOption(date)}
                    </option>
                  ))}
                </select>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Table Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Table
              </label>
              <div className="relative">
                <select
                  value={selectedTable || ""}
                  onChange={(e) =>
                    setSelectedTable(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                >
                  <option value="">All tables</option>
                  {uniqueTables.map((table) => (
                    <option key={table} value={table}>
                      Table {table}
                    </option>
                  ))}
                </select>
                {selectedTable && (
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sales Rep Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Sales Rep
              </label>
              <div className="relative">
                <select
                  value={selectedSalesRep || ""}
                  onChange={(e) => setSelectedSalesRep(e.target.value || null)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                >
                  <option value="">All reps</option>
                  {uniqueSalesReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name}
                    </option>
                  ))}
                </select>
                {selectedSalesRep && (
                  <button
                    onClick={() => setSelectedSalesRep(null)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All ({getActiveFilterCount()})
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>

              {filter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Status: {filter}
                  <button
                    onClick={() => setFilter("all")}
                    className="hover:bg-primary/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Date: {formatDateOption(new Date(selectedDate).toString())}
                  <button
                    onClick={() => setSelectedDate("")}
                    className="hover:bg-primary/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedTable && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Table: {selectedTable}
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="hover:bg-primary/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSalesRep && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  Rep:{" "}
                  {uniqueSalesReps.find((r) => r.id === selectedSalesRep)?.name}
                  <button
                    onClick={() => setSelectedSalesRep(null)}
                    className="hover:bg-primary/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
