import type { Metadata } from "next";
import { Manrope, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const dmMono = DM_Mono({ weight: "400", subsets: ["latin"], variable: "--font-dm-mono", display: "swap" });
const instrumentSerif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-instrument-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Tarun Sunil · Systems & AI",
  description: "A spatial portfolio for Tarun Sunil.",
  openGraph: {
    title: "Tarun Sunil · Systems & AI",
    description: "A spatial portfolio for Tarun Sunil — systems, AI, and selected work.",
    siteName: "Tarun Sunil",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Tarun Sunil · Systems & AI",
    description: "A spatial portfolio for Tarun Sunil — systems, AI, and selected work."
  }
};

const themeScript = `try{var t=localStorage.getItem("theme");if(!t){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${dmMono.variable} ${instrumentSerif.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
