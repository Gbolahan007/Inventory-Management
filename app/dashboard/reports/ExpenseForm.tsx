"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react"; // ✅ import spinner icon
import { addExpense } from "@/app/_lib/actions";
import toast from "react-hot-toast";

const categories = [
  "Fuel",
  "Toiletries",
  "Electricity",
  "Subscription",
  "Soap",
  "Drinks",
  "Transport",
  "Miscellaneous",
  "Other",
];

export default function ExpenseForm({
  selectedDate,
}: {
  selectedDate: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      setLoading(true);
      await addExpense(formData);
      toast("Expense saved successfully!");
      setShowForm(false);
    } catch (error) {
      toast("Failed to save expense");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
      >
        {showForm ? "Hide Expense Form" : "Add Expenses"}
      </button>

      {showForm && (
        <form
          action={handleSubmit}
          className="mt-4 p-4 bg-muted rounded-lg border border-border space-y-4"
        >
          <input type="hidden" name="expense_date" value={selectedDate} />

          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              name="category"
              className="w-full mt-1 p-2 border rounded-md bg-background"
              required
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Amount (₦)</label>
            <input
              type="number"
              name="amount"
              min="0"
              step="100"
              className="w-full mt-1 p-2 border rounded-md bg-background"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                {/* mini spinner */}
                Saving...
              </>
            ) : (
              "Save Expense"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
