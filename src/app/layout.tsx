import type { Metadata } from "next";
import { fredoka, figtree, plexMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookApricity",
  description: "Booking and membership management for clubs and associations.",
  icons: {
    apple: "/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${figtree.variable} ${plexMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
