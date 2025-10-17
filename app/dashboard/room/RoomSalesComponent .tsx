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
  price?: number | string;
  total_price?: number;
  category: string;
  created_at?: string;
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
      (sum, booking) => sum + (Number(booking.total_price) || 0),
      0
    );
    const shortRestTotal = shortRestSales.reduce(
      (sum, booking) => sum + (Number(booking.total_price) || 0),
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

  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";

    const utcDate = new Date(dateString);
    const datePart = utcDate.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Africa/Lagos",
    });
    const timePart = utcDate.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos",
    });
    return `${datePart} • ${timePart}`;
  };

  const totalSales = salesData.roomTotal + salesData.shortRestTotal;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 lg:p-6 text-foreground transition-colors duration-300 ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-7">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Sales Dashboard
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Overview of your bookings and revenue
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Room Bookings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Room Bookings
              </h2>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Bed className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {formatCurrency(salesData.roomTotal)}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {salesData.roomCount} booking
              {salesData.roomCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Short Rest */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Short Rest
              </h2>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {formatCurrency(salesData.shortRestTotal)}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {salesData.shortRestCount} booking
              {salesData.shortRestCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Total Sales */}
          <div className="dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6  hover:scale-105 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Total Sales
              </h2>
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 dark:text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {formatCurrency(totalSales)}
            </p>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-white">
              {salesData.roomCount + salesData.shortRestCount} total bookings
            </p>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Room Bookings Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-slate-900 dark:text-white">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mr-2">
                <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Room Bookings Details
            </h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300">
                        Nights
                      </th>
                      <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">
                        Customer
                      </th>
                      <th className="text-center py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">
                        Discount
                      </th>
                      <th className="text-right py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                        Price
                      </th>
                      <th className="text-right py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.roomSales.length > 0 ? (
                      salesData.roomSales.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 whitespace-nowrap text-xs sm:text-sm">
                            {formatDateTime(booking.created_at)}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 font-medium">
                            {booking.room_type}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200">
                            {booking.num_nights ?? "-"}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 hidden lg:table-cell">
                            {booking.customer_type}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">
                            {booking.discount_sale === "true" ||
                            booking.discount_sale === true ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                No
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-right text-slate-900 dark:text-slate-200 hidden sm:table-cell">
                            {formatCurrency(booking.price || 0)}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-right font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(booking.total_price || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-slate-500 dark:text-slate-400"
                        >
                          No room bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Short Rest Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-slate-900 dark:text-white">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg mr-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              Short Rest Details
            </h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">
                        Customer
                      </th>
                      <th className="text-center py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">
                        Discount
                      </th>
                      <th className="text-right py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                        Price
                      </th>
                      <th className="text-right py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.shortRestSales.length > 0 ? (
                      salesData.shortRestSales.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 whitespace-nowrap text-xs sm:text-sm">
                            {formatDateTime(booking.created_at)}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 font-medium">
                            {booking.room_type}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 hidden lg:table-cell">
                            {booking.customer_type}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">
                            {booking.discount_sale === "true" ||
                            booking.discount_sale === true ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                No
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-right text-slate-900 dark:text-slate-200 hidden sm:table-cell">
                            {formatCurrency(booking.price || 0)}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-right font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(booking.total_price || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-slate-500 dark:text-slate-400"
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
    </div>
  );
}
