"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-white text-black hover:bg-gray-200 font-medium py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}
