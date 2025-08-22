import { SaleItem } from "@/app/dashboard/reports/page";
import { ShoppingCart, Users, X } from "lucide-react";

interface ModalHeaderProps {
  isDarkMode: boolean;
  onClose: () => void;
  activeTables: number[];
  selectedTable: number;
  currentCart: SaleItem[];
  onOpenMobileCart: () => void;
}

export default function ModalHeader({
  isDarkMode,
  onClose,
  activeTables,
  selectedTable,
  currentCart,
  onOpenMobileCart,
}: ModalHeaderProps) {
  return (
    <div
      className={`p-3 sm:p-6 border-b ${
        isDarkMode ? "border-slate-700" : "border-gray-200"
      }`}
    >
      {/* Top row - Title and Close button */}
      <div className="flex items-center justify-between mb-3 sm:mb-0">
        <h2
          className={`text-lg sm:text-xl md:text-2xl font-bold truncate ${
            isDarkMode ? "text-slate-100" : "text-gray-900"
          }`}
        >
          Table Order Management
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={`p-1.5 sm:p-2 rounded-full hover:scale-110 transition-transform ${
            isDarkMode
              ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          }`}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Bottom row - Stats and Cart button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {activeTables.length} active tables
          </span>
        </div>

        {/* Mobile Cart Button */}
        <button
          type="button"
          onClick={onOpenMobileCart}
          className={`md:hidden flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium min-w-0 ${
            isDarkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <ShoppingCart className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            Table {selectedTable} ({currentCart.length})
          </span>
        </button>
      </div>
    </div>
  );
}
