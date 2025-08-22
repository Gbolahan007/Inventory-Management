"use client";

import type { RootState } from "@/app/store";
import {
  BarChart2,
  BarChart3,
  Boxes,
  FileText,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setIsCollapsed } from "../state/global";
import { useAuth } from "../(auth)/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  // { name: "Users", href: "/users", icon: Users },
  { name: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { name: "sales", href: "/dashboard/sales", icon: BarChart3 },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Bar", href: "/dashboard/bar", icon: BarChart2 },

  { name: "Settings", href: "/admin", icon: Settings },
];

export function Sidebar() {
  const isSidebarCollapsed = useSelector(
    (state: RootState) => state.global.isCollapsed
  );
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, userRole } = useAuth();

  return (
    <>
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden "
          onClick={() => {
            dispatch(setIsCollapsed(true));
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out h-screen shadow-sm
          ${
            isSidebarCollapsed
              ? "fixed md:relative -translate-x-full md:translate-x-0 md:w-20 w-64 z-50 md:z-auto"
              : "fixed md:relative translate-x-0 md:w-64 w-64 z-50 md:z-auto "
          }`}
      >
        {/* Logo/Brand */}
        <div
          className={`p-6 border-border ${isSidebarCollapsed ? "md:px-4" : ""}`}
        >
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "md:justify-center" : "space-x-3"
            }`}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg truncate">I</span>
            </div>
            {(!isSidebarCollapsed || window.innerWidth < 768) && (
              <div className="flex">
                <span className="text-xl font-bold text-foreground truncate">
                  Inspect
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    dispatch(setIsCollapsed(true));
                  }
                }}
                className={`group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isSidebarCollapsed ? "md:justify-center" : "space-x-3"
                } ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                    : "text-secondary hover:bg-muted hover:text-foreground"
                }`}
                title={isSidebarCollapsed ? item.name : ""}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}

                <item.icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-secondary group-hover:text-foreground"
                  }`}
                />

                {(!isSidebarCollapsed || window.innerWidth < 768) && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div
            className={`flex items-center py-3 rounded-xl hover:bg-muted transition-colors duration-200 cursor-pointer group ${
              isSidebarCollapsed ? "md:justify-center" : "space-x-3"
            }`}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {userRole?.split("")[0].toUpperCase()}
              </span>
            </div>

            {(!isSidebarCollapsed || window.innerWidth < 768) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userRole}
                </p>
                <p className="text-xs text-secondary truncate">{user?.email}</p>
              </div>
            )}

            {/* Tooltip for collapsed state - only on desktop */}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden md:block">
                <div className="font-medium"> {userRole}</div>
                <div className="opacity-75">{user?.email}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
