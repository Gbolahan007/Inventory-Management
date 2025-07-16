"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface POSHeaderProps {
  isDarkMode: boolean;
  onAddSale: () => void;
}

export function POSHeader({ isDarkMode, onAddSale }: POSHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Point of Sale System
        </h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Manage your sales and inventory
        </p>
      </div>
      <Button
        onClick={onAddSale}
        size="lg"
        className={`${
          isDarkMode
            ? "bg-green-600 hover:bg-green-700"
            : "bg-green-600 hover:bg-green-700"
        } text-white`}
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Sale
      </Button>
    </div>
  );
}
