// app/(dashboard)/layout.tsx
import { Header } from "@/app/components/Header";
import { Sidebar } from "@/app/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-y-hidden">
      <div>
        <Sidebar />
      </div>
      <div className="flex flex-col overflow-x-hidden min-h-0 flex-1">
        <Header />
        <main className="flex-1 overflow-auto bg-muted">{children}</main>
      </div>
    </div>
  );
}
