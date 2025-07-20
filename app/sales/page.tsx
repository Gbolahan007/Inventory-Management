"use client";
import type { RootState } from "@/app/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useProducts } from "../components/queryhooks/useProducts"; // Assuming these hooks are outside the sales folder
import { useRecentSales } from "../components/queryhooks/useRecentSales";
import { useStats } from "../components/queryhooks/useStats";
import AddToSaleModal from "./(sales)/AddToSaleModal";
import { LoadingSpinner } from "./(sales)/LoadingSpinner";
import { POSHeader } from "./(sales)/POSHeader";
import { ProductInventoryTable } from "./(sales)/ProductInventoryTable";
import { RecentSalesTable } from "./(sales)/RecentSalesTable";
import { StatsCards } from "./(sales)/StatsCards";
import { useTopSellingProducts } from "../components/queryhooks/useTopSellingProducts";

export default function SalesPage() {
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const isDarkMode = useSelector((state: RootState) => state.global.theme);

  // Use React Query hooks
  const { products = [], isLoading: productsLoading } = useProducts();
  const { recentSales = [], isLoading: salesLoading } = useRecentSales();
  const { stats, isLoading: statsLoading } = useStats();
  const { topSellingProducts: salesItems } = useTopSellingProducts();

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
          salesItems={salesItems}
          isDarkMode={isDarkMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentSalesTable
            sales={recentSales}
            salesItems={salesItems}
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
