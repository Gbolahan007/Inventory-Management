// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./index.css";
import { Toaster } from "react-hot-toast";
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
              <Toaster position="top-center" />
              {children}
            </ThemeWrapper>
          </StoreProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
