"use client";

import { addRoomBooking } from "@/app/_lib/actions";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = ["Walk-In", "Regular"];
const ROOM_TYPES = ["Classic", "Standard", "Hourly", "Quick To Stay"];
const BOOKING_CATEGORIES = ["Room", "Short Rest"];
const DISCOUNT_OPTIONS = ["No", "Yes"];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Saving...</span>
        </>
      ) : (
        "Save Booking"
      )}
    </button>
  );
}

const RoomBookingForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [price, setPrice] = useState<number>(0);
  const [numNights, setNumNights] = useState<number | string>(1);

  const total = price * (Number(numNights) || 0);

  const handleSubmit = async (formData: FormData) => {
    const toastId = toast.loading("Saving booking...");

    try {
      await addRoomBooking(formData);
      toast.success("Booking saved successfully ✅", { id: toastId });

      formRef.current?.reset();
      setPrice(0);
      setNumNights(1);
    } catch (err) {
      toast.error("Error saving booking ❌", { id: toastId });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3">
      <div className="w-full max-w-2xl">
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-5 py-3">
            <h2 className="text-lg font-bold text-primary-foreground">
              Add Room Booking
            </h2>
            <p className="text-primary-foreground/80 text-xs mt-0.5">
              Fill in the details to create a new booking
            </p>
          </div>

          {/* Form */}
          <div className="p-5">
            <form ref={formRef} action={handleSubmit} className="space-y-4">
              {/* ✅ Customer Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="customer_name"
                  className="text-sm font-medium text-foreground block"
                >
                  Customer Name
                </label>
                <input
                  id="customer_name"
                  type="text"
                  name="customer_name"
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm"
                  required
                />
              </div>

              {/* Category & Customer Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="category"
                    className="text-sm font-medium text-foreground block"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    {BOOKING_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="customer_type"
                    className="text-sm font-medium text-foreground block"
                  >
                    Customer Type
                  </label>
                  <select
                    id="customer_type"
                    name="customer_type"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    {CATEGORY_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room Type & Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="room_type"
                    className="text-sm font-medium text-foreground block"
                  >
                    Room Type
                  </label>
                  <select
                    id="room_type"
                    name="room_type"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    {ROOM_TYPES.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="discount_sale"
                    className="text-sm font-medium text-foreground block"
                  >
                    Discount Sale?
                  </label>
                  <select
                    id="discount_sale"
                    name="discount_sale"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    {DISCOUNT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Nights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
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
                      value={price || ""}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-background border border-input rounded-md text-foreground text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="num_nights"
                    className="text-sm font-medium text-foreground block"
                  >
                    Number of Nights
                  </label>
                  <input
                    id="num_nights"
                    type="number"
                    name="num_nights"
                    value={numNights}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") setNumNights("");
                      else setNumNights(Number(value));
                    }}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground text-sm"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* ✅ Hidden total field */}
              <input type="hidden" name="total" value={total} />

              {/* Total Display */}
              <div className="bg-muted px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground text-center">
                Total: ₦{total.toLocaleString()}
              </div>

              <SubmitButton />
            </form>
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 bg-muted border-t border-border">
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
