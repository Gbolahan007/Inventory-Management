"use client";

import type React from "react";
import { Receipt } from "lucide-react";

interface Expense {
  id: string;
  booking_id: string | number;
  expense_type: string;
  amount: number;
  created_at: string;
}

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
  expenses?: Expense[];
}

interface BookingsTableProps {
  title: string;
  icon: React.ReactNode;
  iconBgClass: string;
  bookings: Booking[];
  bookingExpenses: Record<string | number, Expense[]>;
  showNights?: boolean;
  onRowClick: (booking: Booking) => void;
  formatCurrency: (amount: number | string) => string;
  formatDateTime: (dateString?: string) => string;
}

export function RoomBookingsTable({
  title,
  icon,
  iconBgClass,
  bookings,
  bookingExpenses,
  showNights = false,
  onRowClick,
  formatCurrency,
  formatDateTime,
}: BookingsTableProps) {
  const getBookingTotal = (booking: Booking) => {
    const basePrice = Number(booking.total_price) || 0;
    const expenses = bookingExpenses[booking.id] || [];
    const expensesTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return basePrice + expensesTotal;
  };

  const BookingRow = ({ booking }: { booking: Booking }) => {
    const expenses = bookingExpenses[booking.id] || [];
    const hasExpenses = expenses.length > 0;

    return (
      <tr
        onClick={() => onRowClick(booking)}
        className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
      >
        <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 whitespace-nowrap text-xs sm:text-sm">
          {formatDateTime(booking.created_at)}
        </td>
        <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200 font-medium">
          <div className="flex items-center gap-2">
            {booking.room_type}
            {hasExpenses && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                <Receipt className="w-3 h-3 mr-1" />
                {expenses.length}
              </span>
            )}
          </div>
        </td>
        {showNights && (
          <td className="py-3 px-2 sm:px-3 text-slate-900 dark:text-slate-200">
            {booking.num_nights ?? "-"}
          </td>
        )}
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
          {formatCurrency(getBookingTotal(booking))}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-slate-900 dark:text-white">
        <div className={`p-2 rounded-lg mr-2 ${iconBgClass}`}>{icon}</div>
        {title}
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
                {showNights && (
                  <th className="text-left py-3 px-2 sm:px-3 font-semibold text-slate-700 dark:text-slate-300">
                    Nights
                  </th>
                )}
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
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={showNights ? 7 : 6}
                    className="py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
