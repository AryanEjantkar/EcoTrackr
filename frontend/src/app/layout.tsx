import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EcoTrackr - Track. Understand. Reduce.",
  description: "An intelligent AI-powered sustainability and carbon footprint tracker dashboard.",
};

import LayoutWrapper from "@/components/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfitFont.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
