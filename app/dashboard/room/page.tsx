"use client";

import { useState } from "react";
import { BedDouble, ClipboardList } from "lucide-react";
import RoomBookingForm from "./RoomBookingForm";
import RoomSalesComponent from "./RoomSalesComponent ";

export default function RoomManagementPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "sales">("bookings");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-foreground">
            Room Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage bookings and room sales easily
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-x-hidden">
          <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === "bookings"
                  ? "text-primary border-b-2 border-primary bg-muted/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BedDouble className="w-5 h-5" />
              Room Bookings
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === "sales"
                  ? "text-primary border-b-2 border-primary bg-muted/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              Room Sales
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "bookings" ? (
          <RoomBookingForm />
        ) : (
          <RoomSalesComponent />
        )}
      </div>
    </div>
  );
}
