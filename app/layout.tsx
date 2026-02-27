import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/app-nav";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "json-render · Generative UI",
  description: "AI-generated UI with json-render",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppNav />
        {children}
      </body>
    </html>
  );
}
