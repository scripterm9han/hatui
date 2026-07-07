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
          {/* Animated Background Mesh Blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Cyan Blob (Maps to Mint #05ffa3) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-neon-cyan/6 blur-[120px] animate-float-slow" />
            
            {/* Violet Blob (Maps to Gold #ffcd00) */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-neon-violet/6 blur-[150px] animate-float-medium" />
            
            {/* Emerald Blob */}
            <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/4 blur-[120px] animate-float-fast" />
            
            {/* Amber Blob */}
            <div className="absolute bottom-[30%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/4 blur-[130px] animate-float-slow" />
          </div>

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
