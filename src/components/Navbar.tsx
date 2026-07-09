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
    <nav className="fixed top-0 left-0 w-full h-16 bg-[var(--color-bg)]/70 backdrop-blur-xl border-b border-[var(--color-border)] z-50">
      <div className="shell h-full flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.jpg" alt="Hatiyar Logo" className="h-9 w-9 rounded-xl object-cover shadow-[0_0_18px_var(--color-accent-glow)] transition-transform group-hover:scale-105" />
            <span className="text-white font-bold font-mono tracking-[0.2em] text-sm group-hover:text-[var(--color-accent)] transition-colors">
              HATIYAR
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/tools" className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-fg-muted)] hover:text-white hover:bg-white/5 transition-colors">
              Tools
            </Link>
            <Link href="/pricing" className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-fg-muted)] hover:text-white hover:bg-white/5 transition-colors">
              Pricing
            </Link>
            {session && (
              <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-fg-muted)] hover:text-white hover:bg-white/5 transition-colors">
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
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field h-9 pl-9 pr-4 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-fg-subtle)]" />
          </div>

          {/* Fuzzy Search Dropdown */}
          {filteredTools.length > 0 && (
            <div className="absolute top-11 left-0 w-full rounded-xl surface p-2 space-y-1 z-50">
              <div className="eyebrow px-2 py-1">
                Found {filteredTools.length} tools
              </div>
              {filteredTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  onClick={() => setSearchQuery("")}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-all"
                >
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-white truncate">{tool.name}</span>
                    <span className="block text-[11px] text-[var(--color-fg-subtle)] truncate max-w-xs">{tool.description}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-fg-subtle)]" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right side Account actions */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-sm font-semibold text-white leading-tight">
                  {session.user?.name || session.user?.email}
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-accent)]">
                  {(session.user as any).plan === "pro" ? "Pro Member" : "Free Plan"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/10 text-[var(--color-fg-muted)] hover:text-[var(--color-danger)] transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <Link href="/auth/signin" className="btn btn-accent-soft btn-md font-mono">
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-[var(--color-border)] p-6 space-y-1 z-50 flex flex-col md:hidden">
          <Link href="/tools" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-lg text-sm font-medium text-[var(--color-fg-muted)] hover:bg-white/5 hover:text-white">
            Tools Index
          </Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-lg text-sm font-medium text-[var(--color-fg-muted)] hover:bg-white/5 hover:text-white">
            Pricing
          </Link>
          {session && (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-lg text-sm font-medium text-[var(--color-fg-muted)] hover:bg-white/5 hover:text-white">
              Dashboard
            </Link>
          )}

          <div className="border-t border-[var(--color-border)] pt-4 mt-2 flex flex-col gap-3">
            {session ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-semibold text-white">{session.user?.email}</span>
                  <span className="block text-[10px] font-mono text-[var(--color-accent)] uppercase">
                    {(session.user as any).plan} Tier
                  </span>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="btn btn-danger-ghost btn-sm"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="btn btn-accent-soft btn-md justify-center">
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
