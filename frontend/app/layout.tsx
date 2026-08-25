import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SBcropmarket — بازار محصولات کشاورزی",
  description: "بازار آنلاین خرید و فروش محصولات کشاورزی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="min-h-screen bg-background text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
