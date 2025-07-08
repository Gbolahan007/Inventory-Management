"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDarkMode = useSelector((state: RootState) => state.global.theme);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
