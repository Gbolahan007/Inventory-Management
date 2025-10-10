import { SaleItem } from "@/app/(dashboard)/TopSellingItems";

interface TableSelectorProps {
  isDarkMode: boolean;
  selectedTable: number;
  onTableSelect: (tableNum: number) => void;
  activeTables: number[];
  getTableCart: (tableNum: number) => SaleItem[];
}

export default function TableSelector({
  isDarkMode,
  selectedTable,
  onTableSelect,
  activeTables,
  getTableCart,
}: TableSelectorProps) {
  return (
    <div
      className={`p-3 sm:p-4 border-b ${
        isDarkMode
          ? "border-slate-700 bg-slate-750"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold">Select Table</h3>
        <div className="text-xs text-gray-500">
          Total items:{" "}
          {activeTables.reduce(
            (sum, tableId) => sum + getTableCart(tableId).length,
            0
          )}
        </div>
      </div>

      {/* Table buttons */}
      <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tableNum) => {
          const isSelected = selectedTable === tableNum;
          const hasItems = activeTables.includes(tableNum);

          return (
            <button
              key={tableNum}
              onClick={() => onTableSelect(tableNum)}
              className={`px-2 sm:px-3 py-2 border-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-w-0 relative ${
                isSelected
                  ? isDarkMode
                    ? "bg-blue-600 text-white shadow-lg border-blue-400"
                    : "bg-blue-500 text-white shadow-lg border-blue-300"
                  : hasItems
                  ? isDarkMode
                    ? "bg-slate-600 text-slate-300 border-slate-400"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                  : isDarkMode
                  ? "bg-slate-700 text-slate-400 hover:bg-slate-600 border-slate-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 border-gray-300"
              }`}
            >
              <span className="block truncate">Table {tableNum}</span>
              {hasItems && (
                <span className="block text-xs opacity-80">
                  ({getTableCart(tableNum).length})
                </span>
              )}
              {/* Active indicator dot */}
              {hasItems && (
                <span
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                    isDarkMode ? "bg-green-400" : "bg-green-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Current table status */}
      {getTableCart(selectedTable).length > 0 && (
        <div className="mt-3">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
              isDarkMode
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-green-100 text-green-800 border-green-300"
            }`}
          >
            Ready for Payment
          </div>
        </div>
      )}
    </div>
  );
}
