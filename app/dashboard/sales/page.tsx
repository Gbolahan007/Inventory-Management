/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import type { RootState } from "@/app/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import AddToSaleModal from "./(sales)/AddToSaleModal";
import { LoadingSpinner } from "./(sales)/LoadingSpinner";
import { POSHeader } from "./(sales)/POSHeader";
import { ProductInventoryTable } from "./(sales)/ProductInventoryTable";
import { RecentSalesTable } from "./(sales)/RecentSalesTable";
import { StatsCards } from "./(sales)/StatsCards";
import { useProducts } from "@/app/components/queryhooks/useProducts";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { useTopSellingProducts } from "@/app/components/queryhooks/useTopSellingProducts";
import { useStats } from "@/app/components/queryhooks/useStats";

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
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const isDarkMode = useSelector((state: RootState) => state.global.theme);

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
        <POSHeader isDarkMode={isDarkMode} onAddSale={handleAddSale} />

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
          <ProductInventoryTable products={products} isDarkMode={isDarkMode} />
        </div>
      </div>
      {isAddSaleOpen && (
        <AddToSaleModal
          isOpen={isAddSaleOpen}
          onClose={() => setIsAddSaleOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
