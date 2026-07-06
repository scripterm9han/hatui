import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlowEffect from "@/components/GlowEffect";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hatiyar - Ultimate Engineering Multi-Tool Suite",
  description: "Formatting, Regex Visualization, QR Encoding, Currency Conversion, and AI-powered Resume checking and roasting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-bg-dark text-slate-100 selection:bg-neon-cyan/30 selection:text-white">
        <SessionProvider>
          {/* Global cursor-follow atmospheric glow & shortcut palette */}
          <GlowEffect />
          <CommandPalette />
          <div className="fixed inset-0 radial-glow pointer-events-none z-0" />
          
          {/* Unified header navigation */}
          <Navbar />
          
          {/* Main page content area */}
          <main className="flex-1 flex flex-col z-10 relative">
            {children}
          </main>
          
          {/* Common footer */}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic";
