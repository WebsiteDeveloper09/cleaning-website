import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "SparklePro | Premium Cleaning Service Booking & Management System",
  description: "Book home deep cleaning, routine maintenance, and move-in cleanings with real-time status tracking, automated cleaner availability matching, and conflict management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b0f19] text-gray-100 min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
