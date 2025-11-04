"use client";

import { useMemo, useState } from "react";
import { DollarSign, Bed, Clock } from "lucide-react";
import { useRoomBookings } from "@/app/components/queryhooks/useRoomBookings";
import { SalesSummaryCard } from "./SalesSummaryCard";
import { RoomBookingsTable } from "./RoomBookingsTable";
import { ExpenseModal } from "./ExpenseModal";
import { useBookingExpensesQuery } from "@/app/components/queryhooks/useRoomExpensesQuery";

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

export default function RoomSalesComponent() {
  const { room_bookings } = useRoomBookings() as { room_bookings: Booking[] };
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  //  Automatically get bookingId from the first booking in the array
  const bookingId = room_bookings?.[0]?.id ?? null;

  //  Fetch expenses for that bookingId
  const { expenses = [] } = useBookingExpensesQuery(bookingId);

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

    const calculateTotal = (booking: Booking) => {
      const basePrice = Number(booking.total_price) || 0;
      const expensesTotal =
        booking.id === bookingId
          ? expenses.reduce((sum, exp) => sum + exp.amount, 0)
          : 0;
      return basePrice + expensesTotal;
    };

    const roomTotal = roomSales.reduce(
      (sum, booking) => sum + calculateTotal(booking),
      0
    );
    const shortRestTotal = shortRestSales.reduce(
      (sum, booking) => sum + calculateTotal(booking),
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
  }, [room_bookings, expenses, bookingId]);

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

  const closeModal = () => setSelectedBooking(null);

  const totalSales = salesData.roomTotal + salesData.shortRestTotal;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 lg:p-6 text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <SalesSummaryCard
            title="Room Bookings"
            amount={formatCurrency(salesData.roomTotal)}
            subtitle={`${salesData.roomCount} booking${
              salesData.roomCount !== 1 ? "s" : ""
            }`}
            icon={Bed}
            iconBgClass="bg-blue-50 dark:bg-blue-900/30"
            iconClass="text-blue-600 dark:text-blue-400"
          />
          <SalesSummaryCard
            title="Short Rest"
            amount={formatCurrency(salesData.shortRestTotal)}
            subtitle={`${salesData.shortRestCount} booking${
              salesData.shortRestCount !== 1 ? "s" : ""
            }`}
            icon={Clock}
            iconBgClass="bg-green-50 dark:bg-green-900/30"
            iconClass="text-green-600 dark:text-green-400"
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <SalesSummaryCard
              title="Total Sales"
              amount={formatCurrency(totalSales)}
              subtitle={`${
                salesData.roomCount + salesData.shortRestCount
              } total bookings`}
              icon={DollarSign}
              iconBgClass="bg-white/20"
              iconClass="text-slate-900 dark:text-white"
              isLarge={true}
            />
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <RoomBookingsTable
            title="Room Bookings Details"
            icon={<Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            iconBgClass="bg-blue-50 dark:bg-blue-900/30"
            bookings={salesData.roomSales}
            bookingExpenses={{ [bookingId || ""]: expenses }}
            showNights={true}
            onRowClick={setSelectedBooking}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
          />
          <RoomBookingsTable
            title="Short Rest Details"
            icon={
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            }
            iconBgClass="bg-green-50 dark:bg-green-900/30"
            bookings={salesData.shortRestSales}
            bookingExpenses={{ [bookingId || ""]: expenses }}
            onRowClick={setSelectedBooking}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
          />
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        selectedBooking={selectedBooking}
        bookingExpenses={{ [bookingId || ""]: expenses }}
        onClose={closeModal}
        onDeleteExpense={() => {}}
        formatCurrency={formatCurrency}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}
