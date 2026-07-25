import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tarun Sunil — Systems & AI",
  description: "A spatial portfolio for Tarun Sunil."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
