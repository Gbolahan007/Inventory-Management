import React from "react";
import { Minus, Plus, X, Clock, CheckCircle } from "lucide-react";
import type { SaleItem } from "../(sales)/types";

interface CartContentProps {
  cartItems: SaleItem[];
  removeFromCart: (productId: string, unitPrice: number) => void;
  updateCartItemQuantity: (
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => void;
  isDarkMode: boolean;
  tableBarRequestStatus: "none" | "pending" | "given";
}

export function CartContent({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  isDarkMode,
  tableBarRequestStatus,
}: CartContentProps) {
  const isLocked = tableBarRequestStatus === "pending";

  // Group items by approval status
  const approvedItems = cartItems.filter(
    (item) => item.approval_status === "approved"
  );
  const pendingItems = cartItems.filter(
    (item) => !item.approval_status || item.approval_status === "pending"
  );

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div
          className={`text-4xl mb-2 ${
            isDarkMode ? "text-slate-400" : "text-gray-400"
          }`}
        >
          🛒
        </div>
        <p className={`${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
          Cart is empty
        </p>
      </div>
    );
  }

  const ItemSection = ({
    title,
    items,
    icon,
    statusColor,
  }: {
    title: string;
    items: SaleItem[];
    icon: React.ReactNode;
    statusColor: string;
  }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4 className={`font-medium text-sm ${statusColor}`}>
            {title} ({items.length})
          </h4>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.product_id}-${item.unit_price}-${index}`}
              className={`p-3 rounded-lg border ${
                isDarkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-gray-200 bg-white"
              } ${isLocked ? "opacity-75" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    ₦{item.unit_price.toLocaleString()} each
                  </p>
                </div>

                {/* Approval Status Badge */}
                <div className="flex items-center gap-2">
                  {item.approval_status === "approved" ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                      <Clock className="w-3 h-3" />
                      Pending
                    </div>
                  )}

                  {!isLocked && (
                    <button
                      onClick={() =>
                        removeFromCart(item.product_id, item.unit_price)
                      }
                      className={`p-1 rounded-full transition-colors ${
                        isDarkMode
                          ? "hover:bg-slate-700 text-slate-400 hover:text-red-400"
                          : "hover:bg-gray-100 text-gray-400 hover:text-red-600"
                      }`}
                      disabled={isLocked}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateCartItemQuantity(
                        item.product_id,
                        item.unit_price,
                        item.quantity - 1
                      )
                    }
                    disabled={isLocked}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                      isDarkMode
                        ? "border-slate-600 hover:bg-slate-700"
                        : "border-gray-300 hover:bg-gray-50"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="w-8 text-center font-medium text-sm">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateCartItemQuantity(
                        item.product_id,
                        item.unit_price,
                        item.quantity + 1
                      )
                    }
                    disabled={isLocked}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                      isDarkMode
                        ? "border-slate-600 hover:bg-slate-700"
                        : "border-gray-300 hover:bg-gray-50"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-sm">
                    ₦{item.total_price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Approved Items */}
      <ItemSection
        title="Bar Approved"
        items={approvedItems}
        icon={<CheckCircle className="w-4 h-4 text-green-600" />}
        statusColor="text-green-600"
      />

      {/* Pending Items */}
      <ItemSection
        title="Pending Bar Approval"
        items={pendingItems}
        icon={<Clock className="w-4 h-4 text-orange-600" />}
        statusColor="text-orange-600"
      />

      {/* Summary */}
      {approvedItems.length > 0 && pendingItems.length > 0 && (
        <div
          className={`p-3 rounded-lg border-2 border-dashed ${
            isDarkMode
              ? "border-slate-600 bg-slate-800/50"
              : "border-gray-300 bg-gray-50/50"
          }`}
        >
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-green-600">Approved Items:</span>
              <span className="font-medium">
                ₦
                {approvedItems
                  .reduce((sum, item) => sum + item.total_price, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">Pending Items:</span>
              <span className="font-medium">
                ₦
                {pendingItems
                  .reduce((sum, item) => sum + item.total_price, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
