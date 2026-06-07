import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const DESCRIPTION = "Roomward is the operations layer for hotels and facilities — where your team and your spaces stay in sync. Live floor plans, work orders, housekeeping, and your PMS, in one place.";

export const metadata: Metadata = {
  metadataBase: new URL("https://roomward.app"),
  title: { default: "Roomward — operations for your spaces", template: "%s · Roomward" },
  description: DESCRIPTION,
  applicationName: "Roomward",
  keywords: ["hotel operations software", "housekeeping management", "facilities management", "work order software", "PMS integration", "RoomMaster", "hotel maintenance", "floor plan software"],
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://roomward.app",
    siteName: "Roomward",
    title: "Roomward — operations for your spaces",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Roomward — operations for your spaces",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080811",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
