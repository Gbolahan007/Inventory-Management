"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface POSHeaderProps {
  isDarkMode: boolean;
  onAddSale: () => void;
}

export function POSHeader({ isDarkMode, onAddSale }: POSHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
      <div className="flex-1 min-w-0">
        <h1
          className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Point of Sale System
        </h1>
        <p
          className={`text-sm sm:text-base mt-1 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Manage your sales and inventory
        </p>
      </div>
      <div className="w-full sm:w-auto">
        <Button
          onClick={onAddSale}
          size="lg"
          className={`w-full sm:w-auto ${
            isDarkMode
              ? "bg-green-600 hover:bg-green-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base`}
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add Sale
        </Button>
      </div>
    </div>
  );
}
