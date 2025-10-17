"use client";

import { useState } from "react";
import {
  Search,
  User,
  Calendar,
  Bed,
  Clock,
  DollarSign,
  X,
} from "lucide-react";
import { useRoomBookings } from "@/app/components/queryhooks/useRoomBookings"; // ✅ your real hook

interface Booking {
  id: number;
  customer_name: string;
  category: string;
  customer_type: string;
  room_type: string;
  discount_sale: string;
  price: number;
  num_nights: number;
  total_price: number;
  created_at: string;
}

export default function CustomerSearchBooking() {
  const { room_bookings } = useRoomBookings() as { room_bookings: Booking[] }; // ✅ use real data
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter customers by search term
  const filteredCustomers = searchTerm
    ? Array.from(
        new Set(
          room_bookings
            ?.filter((booking) =>
              booking.customer_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map((booking) => booking.customer_name)
        )
      )
    : [];

  // Get bookings for selected customer
  const customerBookings = selectedCustomer
    ? room_bookings.filter(
        (booking) => booking.customer_name === selectedCustomer
      )
    : [];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Africa/Lagos",
    });
  };

  const handleBookingSelect = (booking: Booking) => setSelectedBooking(booking);

  const handleUseBooking = () => {
    if (selectedBooking) {
      // Here you would populate your form with the selected booking data
      console.log("Using booking:", selectedBooking);
      alert(
        `Booking details loaded! Fill form with:\n- Room Type: ${selectedBooking.room_type}\n- Customer Type: ${selectedBooking.customer_type}\n- Category: ${selectedBooking.category}`
      );
    }
  };

  const clearSelection = () => {
    setSelectedCustomer(null);
    setSelectedBooking(null);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Search className="w-7 h-7" />
              Customer Search & Booking History
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Search for returning customers and view their booking history
            </p>
          </div>

          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search Customer by Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedCustomer(null);
                    setSelectedBooking(null);
                  }}
                  placeholder="Type customer name..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={clearSelection}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Customer Suggestions */}
              {searchTerm &&
                filteredCustomers.length > 0 &&
                !selectedCustomer && (
                  <div className="mt-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setSearchTerm(customer);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                      >
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-slate-900 dark:text-white font-medium">
                          {customer}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Customer Info & Bookings */}
            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg border border-blue-200 dark:border-slate-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {selectedCustomer}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {customerBookings.length} booking
                          {customerBookings.length !== 1 ? "s" : ""} on record
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Booking History Grid */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Booking History
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => handleBookingSelect(booking)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                          selectedBooking?.id === booking.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                            : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {booking.category === "Short Rest" ? (
                              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {booking.room_type}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(booking.created_at)}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                              Category:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {booking.category}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                              Customer Type:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {booking.customer_type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                              Nights:
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {booking.num_nights}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                              Discount:
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.discount_sale === "Yes"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {booking.discount_sale}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              Total:
                            </span>
                            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                              {formatCurrency(booking.total_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {selectedBooking && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleUseBooking}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      <Bed className="w-5 h-5" />
                      Use This Booking
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!selectedCustomer && !searchTerm && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Search for a Customer
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Start typing a customer&apos;s name to view their booking
                  history and quickly create a new booking with their previous
                  preferences.
                </p>
              </div>
            )}

            {searchTerm &&
              filteredCustomers.length === 0 &&
              !selectedCustomer && (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Customers Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    No customers match &ldquo;{searchTerm}&ldquo;. Try a
                    different name.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
