"use client";

interface ReportsLayoutProps {
  children: React.ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        {/* Main Content Area */}
        <div className="bg-card rounded-lg shadow-sm border border-border min-h-[600px] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
