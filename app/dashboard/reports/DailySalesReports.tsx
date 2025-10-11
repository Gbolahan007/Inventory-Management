import { useDailySalesReport } from "@/app/components/queryhooks/useDailySalesReport";
import React, { useState, useMemo } from "react";
import { Calendar, DollarSign, Filter } from "lucide-react";
import { useRoomBookings } from "@/app/components/queryhooks/useRoomBookings";

// ✅ Types
interface DailySalesRecord {
  date: string;
  drinkSales?: number;
  cigarette?: number;
  totalSales?: number;
}

interface Booking {
  id: string | number;
  room_type: string;
  num_nights?: number;
  customer_type?: string;
  discount_sale?: boolean | string;
  total_price?: number;
  category: string;
  created_at: string;
}

function DailySalesReports() {
  const { dailySalesReport } = useDailySalesReport() as {
    dailySalesReport: DailySalesRecord[] | undefined;
  };

  const { room_bookings } = useRoomBookings() as { room_bookings: Booking[] };

  const [filterType, setFilterType] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // ✅ Local date helpers (fixed timezone issue)
  const getLocalDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-CA"); // YYYY-MM-DD local
  const today = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString(
    "en-CA"
  );

  // ✅ Filter drink/cigarette data
  const filteredSalesData = useMemo(() => {
    if (!dailySalesReport) return [];

    let filtered = [...dailySalesReport];

    switch (filterType) {
      case "today":
        filtered = filtered.filter((item) => item.date === today);
        break;
      case "yesterday":
        filtered = filtered.filter((item) => item.date === yesterday);
        break;
      case "weekly":
        filtered = filtered.filter(
          (item) => item.date >= sevenDaysAgo && item.date <= today
        );
        break;
      case "monthly":
        if (selectedMonth)
          filtered = filtered.filter((item) =>
            item.date.startsWith(selectedMonth)
          );
        break;
      default:
        break;
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [
    dailySalesReport,
    filterType,
    selectedMonth,
    today,
    yesterday,
    sevenDaysAgo,
  ]);

  // ✅ Filter room bookings by date (fixed timezone)
  const filteredBookings = useMemo(() => {
    if (!room_bookings) return [];

    let filtered = [...room_bookings];

    switch (filterType) {
      case "today":
        filtered = filtered.filter((b) => getLocalDate(b.created_at) === today);
        break;
      case "yesterday":
        filtered = filtered.filter(
          (b) => getLocalDate(b.created_at) === yesterday
        );
        break;
      case "weekly":
        filtered = filtered.filter(
          (b) =>
            getLocalDate(b.created_at) >= sevenDaysAgo &&
            getLocalDate(b.created_at) <= today
        );
        break;
      case "monthly":
        if (selectedMonth)
          filtered = filtered.filter((b) =>
            getLocalDate(b.created_at).startsWith(selectedMonth)
          );
        break;
      default:
        break;
    }

    return filtered;
  }, [
    room_bookings,
    filterType,
    selectedMonth,
    today,
    yesterday,
    sevenDaysAgo,
  ]);

  // ✅ Group bookings by date and category (Room / Short Rest)
  const groupedRoomData = useMemo(() => {
    const grouped: Record<
      string,
      { room: number; shortRest: number; total: number }
    > = {};

    filteredBookings.forEach((b) => {
      const date = getLocalDate(b.created_at); // ✅ use local date
      const price = b.total_price || 0;
      if (!grouped[date]) grouped[date] = { room: 0, shortRest: 0, total: 0 };

      if (b.category === "Room") grouped[date].room += price;
      if (b.category === "Short Rest") grouped[date].shortRest += price;
      grouped[date].total += price;
    });

    return grouped;
  }, [filteredBookings]);

  // ✅ Totals for Drinks, Cigarettes, Rooms
  const totals = useMemo(() => {
    const drink = filteredSalesData.reduce(
      (acc, item) => acc + (item.drinkSales || 0),
      0
    );
    const cig = filteredSalesData.reduce(
      (acc, item) => acc + (item.cigarette || 0),
      0
    );

    const room = Object.values(groupedRoomData).reduce(
      (acc, day) => acc + day.room,
      0
    );
    const shortRest = Object.values(groupedRoomData).reduce(
      (acc, day) => acc + day.shortRest,
      0
    );

    return {
      drink,
      cig,
      room,
      shortRest,
      total: drink + cig + room + shortRest,
    };
  }, [filteredSalesData, groupedRoomData]);

  // ✅ Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-background p-1 md:p-2 lg:p-4 ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Daily Sales Report
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze your sales performance
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Filters
            </h2>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-card-foreground block mb-2">
                Quick Filter
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", "today", "yesterday", "weekly"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setFilterType(filter);
                      if (filter !== "monthly") setSelectedMonth("");
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {filter === "weekly"
                      ? "Last 7 Days"
                      : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium text-card-foreground block mb-2">
                Monthly Filter
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setFilterType("monthly");
                }}
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* ✅ Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Room Sales", value: totals.room },
            { label: "Short Rest", value: totals.shortRest },
            { label: "Drink Sales", value: totals.drink },
            { label: "Cigarette", value: totals.cig },
            { label: "Grand Total", value: totals.total },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </h3>
              </div>
              <p className="text-xl font-bold text-card-foreground break-words">
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ Sales Table */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Sales Records
            </h2>
            <span className="ml-auto text-sm text-muted-foreground">
              {filteredSalesData.length + Object.keys(groupedRoomData).length}{" "}
              records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Room Sales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Short Rest
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Drink Sales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cigarette
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(groupedRoomData).map(([date, roomData]) => {
                  const drink =
                    filteredSalesData.find((d) => d.date === date)
                      ?.drinkSales || 0;
                  const cig =
                    filteredSalesData.find((d) => d.date === date)?.cigarette ||
                    0;
                  const total =
                    roomData.room + roomData.shortRest + drink + cig;

                  return (
                    <tr key={date} className="hover:bg-muted/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(date)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(roomData.room)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(roomData.shortRest)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(drink)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(cig)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailySalesReports;
