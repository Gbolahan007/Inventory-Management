"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

interface AddSaleSubmitButtonProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

export default function AddSaleSubmitButton({
  children,
  isDarkMode,
}: AddSaleSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isDarkMode
          ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800"
          : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400"
      } ${pending ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
    >
      {pending ? "Adding Sale..." : children}
    </Button>
  );
}
