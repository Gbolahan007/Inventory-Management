"use client";

import type { RootState } from "@/app/store";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setIsCollapsed, setIsDarkMode } from "../state/global";

export function Header() {
  const isSidebarCollapsed = useSelector(
    (state: RootState) => state.global.isCollapsed
  );
  const isDarkMode = useSelector((state: RootState) => state.global.theme);
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(setIsCollapsed(!isSidebarCollapsed));
  };

  const handleThemeToggle = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  return (
    <header className="bg-card border-b  border-border px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left section - Toggle & Title */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors"
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-secondary" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-secondary" />
            )}
          </button>

          {/* Title */}
          <div className="md:hidden lg:block">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-secondary hidden sm:block">
              Welcome back, John!
            </p>
          </div>
        </div>

        {/* Right section - Search, Bell, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search input */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-64 bg-muted focus:bg-card transition-colors text-foreground placeholder-secondary"
            />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2.5 text-secondary hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notification */}
          <button
            className="relative p-2.5 text-secondary hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card animate-pulse shadow-sm"></span>
          </button>

          {/* User */}
          <button
            className="flex items-center space-x-2 p-2 text-secondary hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            aria-label="User Menu"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-accent to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-card">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
