import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./index.css";

import { Header } from "@/app/components/Header";
import { Sidebar } from "@/app/components/Sidebar";
import StoreProvider from "./contexts/Storeprovider";
import ThemeWrapper from "./components/utils/Themewrapper";
import ReactQueryProvider from "./components/ReactQueryProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dashboard App",
  description: "A modern dashboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ReactQueryProvider>
          <StoreProvider>
            <ThemeWrapper>
              <div className="flex h-screen   ">
                <div>
                  <Sidebar />
                </div>
                {/* Main Content Area */}
                <div className="flex flex-col overflow-x-hidden min-h-0 flex-1 ">
                  <Header />
                  <main className="flex-1 overflow-auto bg-muted">
                    {children}
                  </main>
                </div>
              </div>
            </ThemeWrapper>
          </StoreProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
