"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Shield, LogOut, LogIn, Sparkles, Star, Menu, X, ArrowUpRight } from "lucide-react";
import { toolsList } from "@/lib/tools-data";

export default function Navbar() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter tools based on query
  const filteredTools = searchQuery.trim()
    ? toolsList.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-bg-dark/80 backdrop-blur-md border-b border-border-card z-50 px-4 md:px-8 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Shield className="h-4.5 w-4.5 text-neon-cyan" />
          </div>
          <span className="text-white font-bold font-mono tracking-wider text-base group-hover:text-neon-cyan transition-colors">
            HATIYAR
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-slate-400">
          <Link href="/tools" className="hover:text-neon-cyan transition-colors">
            Tools
          </Link>
          <Link href="/pricing" className="hover:text-neon-cyan transition-colors">
            Pricing
          </Link>
          {session && (
            <Link href="/dashboard" className="hover:text-neon-cyan transition-colors">
              Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden sm:block flex-1 max-w-sm mx-4 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Fuzzy search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg mono-input text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        </div>

        {/* Fuzzy Search Dropdown */}
        {filteredTools.length > 0 && (
          <div className="absolute top-11 left-0 w-full rounded-xl border border-border-card bg-bg-card shadow-2xl p-2 space-y-1 z-50">
            <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1">
              Found {filteredTools.length} tools
            </div>
            {filteredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                onClick={() => setSearchQuery("")}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-card-hover text-slate-300 hover:text-neon-cyan transition-all"
              >
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-white truncate">{tool.name}</span>
                  <span className="block text-[10px] text-slate-500 truncate max-w-xs">{tool.description}</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-600" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right side Account actions */}
      <div className="hidden md:flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-xs font-semibold text-white">
                {session.user?.name || session.user?.email}
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-wider text-neon-cyan">
                {(session.user as any).plan === "pro" ? "PRO MEMBER" : "FREE PLAN"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/signin"
            className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg border border-slate-800 text-slate-300 hover:text-neon-cyan"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-bg-card border-b border-border-card p-6 space-y-4 z-50 flex flex-col font-mono text-xs uppercase tracking-wider md:hidden">
          <Link
            href="/tools"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-neon-cyan transition-colors"
          >
            Tools Index
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-neon-cyan transition-colors"
          >
            Pricing
          </Link>
          {session && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon-cyan transition-colors"
            >
              Dashboard
            </Link>
          )}
          
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            {session ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-white">{session.user?.email}</span>
                  <span className="block text-[9px] font-mono text-neon-cyan uppercase">
                    {(session.user as any).plan} Tier
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 bg-red-500/5 text-xs font-mono"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
