/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useProducts } from "@/app/components/queryhooks/useProducts";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { useStats } from "@/app/components/queryhooks/useStats";
import { useTopSellingProducts } from "@/app/components/queryhooks/useTopSellingProducts";
import type { RootState } from "@/app/store";
import { ShoppingCart, Users, BarChart3, Package } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "./(sales)/LoadingSpinner";
import { ProductInventoryTable } from "./(sales)/ProductInventoryTable";
import { RecentSalesTable } from "./(sales)/RecentSalesTable";
import { StatsCards } from "./(sales)/StatsCards";
import TableAddToSaleModal from "./(salestable)/TableAddToSaleModal";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import BarRequestsPage from "./(barRequests)/BarRequestsPage";
import { useAuth } from "@/app/(auth)/hooks/useAuth";

type SaleItem = {
  id?: string;
  sale_id?: string | number;
  product_id: string;
  quantity: number;
  unit_price?: number;
  unit_cost?: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  created_at?: string;
  products?: {
    name: string;
    category?: string;
  };
};

export default function SalesPage() {
  const { userData } = useAuth();
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "bar-requests">(
    "dashboard"
  );
  const isDarkMode = useSelector((state: RootState) => state.global.theme);

  // Table cart store
  const { getActiveTables, getTableCart, getTableTotal } = useTableCartStore();
  const activeTables = getActiveTables();
  const totalActiveItems = activeTables.reduce(
    (sum, tableId) => sum + getTableCart(tableId).length,
    0
  );
  // const totalActiveAmount = activeTables.reduce(
  //   (sum, tableId) => sum + getTableTotal(tableId),
  //   0
  // );

  // Use React Query hooks
  const { products = [], isLoading: productsLoading } = useProducts();
  const { recentSales = [], isLoading: salesLoading } = useRecentSales();
  const { stats, isLoading: statsLoading } = useStats();
  const { topSellingProducts: rawSalesItems } = useTopSellingProducts();

  // Transform the data to match SaleItem type
  const salesItems: SaleItem[] | undefined = rawSalesItems?.map(
    (item: any) => ({
      id: item.id,
      sale_id: item.sale_id,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      unit_price: item.unit_price ? Number(item.unit_price) : undefined,
      unit_cost: item.unit_cost ? Number(item.unit_cost) : undefined,
      total_price: Number(item.total_price),
      total_cost: Number(item.total_cost),
      profit_amount: Number(item.profit_amount),
      created_at: item.created_at,
      products:
        Array.isArray(item.products) && item.products.length > 0
          ? {
              name: item.products[0].name,
              category: item.products[0].category,
            }
          : item.products && typeof item.products === "object"
          ? {
              name: item.products.name,
              category: item.products.category,
            }
          : undefined,
    })
  );

  const handleAddSale = () => {
    setIsAddSaleOpen(true);
  };

  if (productsLoading || salesLoading || statsLoading) {
    return <LoadingSpinner isDarkMode={isDarkMode} />;
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } p-6`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced POS Header with Table Info */}
        <div
          className={`rounded-lg shadow-sm border ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1
                  className={`text-2xl lg:text-3xl font-bold ${
                    isDarkMode ? "text-slate-100" : "text-gray-900"
                  }`}
                >
                  Point of Sale Dashboard
                </h1>
                <p
                  className={`text-sm mt-1 ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Manage your restaurant sales and table orders
                </p>
              </div>

              {/* Table Status Summary */}
              {activeTables.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isDarkMode
                        ? "bg-slate-700 border border-slate-600"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        className={`w-5 h-5 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <div>
                        <div
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-700"
                          }`}
                        >
                          Active Tables
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            isDarkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          {activeTables.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isDarkMode
                        ? "bg-slate-700 border border-slate-600"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart
                        className={`w-5 h-5 ${
                          isDarkMode ? "text-green-400" : "text-green-600"
                        }`}
                      />
                      <div>
                        <div
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-slate-300" : "text-gray-700"
                          }`}
                        >
                          Pending Items
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          {totalActiveItems}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddSale}
                className={`px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } shadow-lg`}
              >
                Manage Table Orders
              </button>
            </div>

            {/* Active Tables Quick View */}
            {activeTables.length > 0 && (
              <div className="mt-6">
                <h3
                  className={`text-sm font-medium mb-3 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Active Table Orders
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {activeTables.map((tableId) => {
                    const tableItems = getTableCart(tableId);
                    const tableTotal = getTableTotal(tableId);
                    return (
                      <div
                        key={tableId}
                        className={`p-3 rounded-lg border text-center ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div
                          className={`text-xs font-medium ${
                            isDarkMode ? "text-slate-400" : "text-gray-600"
                          }`}
                        >
                          Table {tableId}
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            isDarkMode ? "text-slate-100" : "text-gray-900"
                          }`}
                        >
                          {tableItems.length}
                        </div>
                        <div
                          className={`text-xs ${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          ₦{tableTotal.toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`rounded-lg shadow-sm border ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "dashboard"
                  ? isDarkMode
                    ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700"
                    : "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Sales Dashboard
            </button>
            <button
              onClick={() => setActiveTab("bar-requests")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "bar-requests"
                  ? isDarkMode
                    ? "text-blue-400 border-b-2 border-blue-400 bg-slate-700"
                    : "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="w-5 h-5" />
              Bar Requests
            </button>
          </div>
        </div>

        {/* Conditional Rendering based on active tab */}
        {activeTab === "dashboard" ? (
          <>
            <StatsCards
              stats={stats}
              salesItems={rawSalesItems} // Use original data for StatsCards
              isDarkMode={isDarkMode}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentSalesTable
                sales={recentSales}
                salesItems={salesItems} // Use transformed data
                isDarkMode={isDarkMode}
              />
              <ProductInventoryTable
                products={products}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        ) : (
          <BarRequestsPage isDarkMode={isDarkMode} />
        )}
      </div>

      {isAddSaleOpen && (
        <TableAddToSaleModal
          isOpen={isAddSaleOpen}
          onClose={() => setIsAddSaleOpen(false)}
          isDarkMode={isDarkMode}
          currentUser={userData?.name}
          currentUserId={userData?.id}
        />
      )}
    </div>
  );
}
