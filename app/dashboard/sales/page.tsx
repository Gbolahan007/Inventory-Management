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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced POS Header with Table Info */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Point of Sale Dashboard
                </h1>
                <p className="text-sm mt-1 text-muted-foreground">
                  Manage your restaurant sales and table orders
                </p>
              </div>

              {/* Table Status Summary */}
              {activeTables.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Active Tables
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {activeTables.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600/10 border border-green-600/20">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Pending Items
                        </div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {totalActiveItems}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddSale}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                Manage Table Orders
              </button>
            </div>

            {/* Active Tables Quick View */}
            {activeTables.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Active Table Orders
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {activeTables.map((tableId) => {
                    const tableItems = getTableCart(tableId);
                    const tableTotal = getTableTotal(tableId);
                    return (
                      <div
                        key={tableId}
                        className="p-3 rounded-lg border border-border bg-card text-center"
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          Table {tableId}
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {tableItems.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
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
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "text-primary border-b-2 border-primary bg-muted/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Sales Dashboard
            </button>
            <button
              onClick={() => setActiveTab("bar-requests")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "bar-requests"
                  ? "text-primary border-b-2 border-primary bg-muted/50"
                  : "text-muted-foreground hover:text-foreground"
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
              salesItems={rawSalesItems}
              isDarkMode={isDarkMode}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentSalesTable
                sales={recentSales}
                salesItems={salesItems}
                isDarkMode={isDarkMode}
              />
              <ProductInventoryTable
                products={products}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        ) : (
          <BarRequestsPage />
        )}
      </div>

      {isAddSaleOpen && (
        <TableAddToSaleModal
          isOpen={isAddSaleOpen}
          onClose={() => setIsAddSaleOpen(false)}
          isDarkMode={isDarkMode}
          currentUser={userData?.name ? { name: userData.name } : undefined}
          currentUserId={userData?.id}
        />
      )}
    </div>
  );
}
