"use client";

import type { RootState } from "@/app/store";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Moon,
  Search,
  Sun,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setIsCollapsed, setIsDarkMode } from "../state/global";
import { useAuth } from "../(auth)/hooks/useAuth";
import { handleLogout } from "../(auth)/logout-action";
import { useState } from "react";

export function Header() {
  const { user, userRole, userData } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
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
              Welcome back,{" "}
              <span className="font-medium">
                {userData?.name
                  ? userData?.name.toUpperCase()
                  : user?.email ?? "Guest"}
              </span>
              !
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

          {/* User Profile Dropdown */}
          <div className="relative ">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 text-secondary hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md "
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-accent to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-card">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.email ?? "Guest User"}
                      </p>
                      <p className="text-xs text-secondary truncate">
                        {userRole
                          ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                          : "User"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center space-x-3">
                    <User className="w-4 h-4 text-secondary" />
                    <span>Profile Settings</span>
                  </button>

                  <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-secondary" />
                    <span>Notifications</span>
                  </button>

                  <div className="border-t border-border my-1"></div>

                  {/* Logout Button */}
                  <form action={handleLogout} className="w-full">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center space-x-3 group"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}
