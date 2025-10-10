"use client";

import React, { useMemo } from "react";
import { DollarSign, Bed, Clock } from "lucide-react";
import { useRoomBookings } from "@/app/components/queryhooks/useRoomBookings";

interface Booking {
  id: string | number;
  room_type: string;
  num_nights?: number;
  customer_type?: string;
  discount_sale?: boolean | string;
  total_price?: number;
  category: string;
}

export default function RoomSalesComponent() {
  const { room_bookings } = useRoomBookings() as { room_bookings: Booking[] };

  const salesData = useMemo(() => {
    if (!room_bookings || room_bookings.length === 0) {
      return {
        roomSales: [] as Booking[],
        shortRestSales: [] as Booking[],
        roomTotal: 0,
        shortRestTotal: 0,
        roomCount: 0,
        shortRestCount: 0,
      };
    }

    const roomSales = room_bookings.filter(
      (booking) => booking.category !== "Short Rest"
    );
    const shortRestSales = room_bookings.filter(
      (booking) => booking.category === "Short Rest"
    );

    const roomTotal = roomSales.reduce(
      (sum, booking) => sum + (booking.total_price || 0),
      0
    );
    const shortRestTotal = shortRestSales.reduce(
      (sum, booking) => sum + (booking.total_price || 0),
      0
    );

    return {
      roomSales,
      shortRestSales,
      roomTotal,
      shortRestTotal,
      roomCount: roomSales.length,
      shortRestCount: shortRestSales.length,
    };
  }, [room_bookings]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const totalSales = salesData.roomTotal + salesData.shortRestTotal;

  return (
    <div className="min-h-screen bg-background p-3 text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Room Bookings */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Room Bookings
              </h2>
              <Bed className="w-8 h-8 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(salesData.roomTotal)}
            </p>
            <p className="text-sm text-muted-foreground">
              {salesData.roomCount} booking
              {salesData.roomCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Short Rest */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Short Rest
              </h2>
              <Clock className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(salesData.shortRestTotal)}
            </p>
            <p className="text-sm text-muted-foreground">
              {salesData.shortRestCount} booking
              {salesData.shortRestCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Total Sales */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Total Sales
              </h2>
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(totalSales)}
            </p>
            <p className="text-sm text-muted-foreground">
              {salesData.roomCount + salesData.shortRestCount} total bookings
            </p>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Bookings Table */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Bed className="w-5 h-5 mr-2 text-primary" />
              Room Bookings Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold">Type</th>
                    <th className="text-left py-2 px-2 font-semibold">
                      Nights
                    </th>
                    <th className="text-left py-2 px-2 font-semibold">
                      Customer
                    </th>
                    <th className="text-center py-2 px-2 font-semibold">
                      Discount
                    </th>
                    <th className="text-right py-2 px-2 font-semibold">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.roomSales.length > 0 ? (
                    salesData.roomSales.map((booking) => (
                      <tr key={booking.id} className="border-b border-border">
                        <td className="py-2 px-2">{booking.room_type}</td>
                        <td className="py-2 px-2">
                          {booking.num_nights ?? "-"}
                        </td>
                        <td className="py-2 px-2">{booking.customer_type}</td>
                        <td className="py-2 px-2 text-center">
                          {booking.discount_sale === "true" ||
                          booking.discount_sale === true ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold">
                          {formatCurrency(booking.total_price || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No room bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Short Rest Table */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
              Short Rest Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold">Type</th>
                    <th className="text-left py-2 px-2 font-semibold">
                      Nights
                    </th>
                    <th className="text-left py-2 px-2 font-semibold">
                      Customer
                    </th>
                    <th className="text-center py-2 px-2 font-semibold">
                      Discount
                    </th>
                    <th className="text-right py-2 px-2 font-semibold">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.shortRestSales.length > 0 ? (
                    salesData.shortRestSales.map((booking) => (
                      <tr key={booking.id} className="border-b border-border">
                        <td className="py-2 px-2">{booking.room_type}</td>
                        <td className="py-2 px-2">
                          {booking.num_nights ?? "-"}
                        </td>
                        <td className="py-2 px-2">{booking.customer_type}</td>
                        <td className="py-2 px-2 text-center">
                          {booking.discount_sale === "true" ||
                          booking.discount_sale === true ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold">
                          {formatCurrency(booking.total_price || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No short rest bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
