"use client";

import { addRoomBooking } from "@/app/_lib/actions";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = ["Walk-In", "Regular"];
const ROOM_TYPES = ["Classic", "Standard", "Hourly", "Quick To Stay"];
const BOOKING_CATEGORIES = ["Room", "Short Rest"];

const RoomBookingForm = () => {
  const handleSubmit = async (formData: FormData) => {
    const toastId = toast.loading("Saving booking...");

    try {
      // Use your actual server action
      await addRoomBooking(formData);
      toast.success("Booking saved successfully ✅", { id: toastId });
    } catch (err) {
      toast.error("Error saving booking ❌", { id: toastId });
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <h2 className="text-xl font-bold text-primary-foreground">
              Add Room Booking
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Fill in the details to create a new booking
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <form action={handleSubmit} className="space-y-6">
              {/* Category Field */}
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-foreground block"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="" className="text-muted-foreground">
                    Select category...
                  </option>
                  {BOOKING_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Type Field */}
              <div className="space-y-2">
                <label
                  htmlFor="customer_type"
                  className="text-sm font-medium text-foreground block"
                >
                  Customer Type
                </label>
                <select
                  id="customer_type"
                  name="customer_type"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="" className="text-muted-foreground">
                    Select customer type...
                  </option>
                  {CATEGORY_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Type Field */}
              <div className="space-y-2">
                <label
                  htmlFor="room_type"
                  className="text-sm font-medium text-foreground block"
                >
                  Room Type
                </label>
                <select
                  id="room_type"
                  name="room_type"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="" className="text-muted-foreground">
                    Select room type...
                  </option>
                  {ROOM_TYPES.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Field */}
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-foreground block"
                >
                  Price (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    ₦
                  </span>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Booking
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              All bookings are subject to availability and terms of service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomBookingForm;
