import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const DESCRIPTION = "Roomward is your hotel operations management assistant — live floor plans, work orders, housekeeping, team chat, and PMS sync in one place. Every issue seen, assigned, and resolved faster.";

export const metadata: Metadata = {
  metadataBase: new URL("https://roomward.app"),
  title: { default: "Roomward — Hotel Maintenance & Operations Management Software", template: "%s · Roomward" },
  description: DESCRIPTION,
  applicationName: "Roomward",
  keywords: ["hotel maintenance software", "hotel operations management software", "hotel work order software", "hotel housekeeping software", "hotel operations assistant", "hospitality maintenance software", "housekeeping management software", "hotel CMMS software", "hotel facility management software", "hotel management software", "RoomMaster integration", "PMS integration"],
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://roomward.app",
    siteName: "Roomward",
    title: "Roomward — Hotel Maintenance & Operations Management",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Roomward — Hotel Maintenance & Operations Management",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  verification: { google: "jV4sEPhvwlRDsdFZn5qbR7WQdX5y64pLwCZJ-VRGgp8" },
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
