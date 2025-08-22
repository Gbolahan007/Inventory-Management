import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FiltersSectionProps {
  filter: "all" | "pending" | "given" | "cancelled";
  setFilter: (filter: "all" | "pending" | "given" | "cancelled") => void;
  selectedTable: number | null;
  setSelectedTable: (table: number | null) => void;
  uniqueTables: number[];
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
  uniqueTables,
  counts,
}: FiltersSectionProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card border rounded-lg shadow text-left hover:bg-muted/30 transition-colors"
        >
          <span className="font-medium text-foreground">Filters</span>
          {showFilters ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Filters */}
      <div
        className={`bg-card border rounded-lg shadow mb-4 sm:mb-6 ${
          showFilters || "hidden sm:block"
        }`}
      >
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 sm:mb-3">
                Filter by Status
              </label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {(["all", "pending", "given", "cancelled"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                        filter === status
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-1">
                        <span className="capitalize">{status}</span>
                        {status !== "all" && (
                          <span className="px-1.5 py-0.5 bg-background/20 rounded-full text-xs">
                            {status === "pending" && counts.pending}
                            {status === "given" && counts.given}
                            {status === "cancelled" && counts.cancelled}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Table Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 sm:mb-3">
                Filter by Table
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTable(null)}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                    selectedTable === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  All Tables
                </button>
                {uniqueTables.map((tableId) => (
                  <button
                    key={tableId}
                    onClick={() => setSelectedTable(tableId)}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                      selectedTable === tableId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Table {tableId}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
