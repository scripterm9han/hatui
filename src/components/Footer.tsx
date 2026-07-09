import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--color-border)] py-12 mt-auto z-10 relative bg-[var(--color-bg)]/40">
      <div className="shell flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand Information */}
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Hatiyar Logo" className="h-7 w-7 rounded-lg object-cover" />
            <span className="text-white font-bold font-mono tracking-wider text-sm">HATIYAR</span>
          </div>
          <p className="text-sm text-[var(--color-fg-subtle)] leading-relaxed">
            A production-grade, fast, multi-tool engineer's arsenal. Formatters, converters, AI resume engines, and utility modules built for speed.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm text-[var(--color-fg-muted)]">
          <div className="space-y-3">
            <span className="block text-white font-semibold">Workspace</span>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="hover:text-[var(--color-accent)] transition-colors">
                  Tools Directory
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--color-accent)] transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <span className="block text-white font-semibold">Legal</span>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-[var(--color-accent)] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--color-accent)] transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="shell border-t border-[var(--color-border)] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-fg-subtle)]">
        <p>© {new Date().getFullYear()} Hatiyar. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Built for developers
          <span className="text-[var(--color-accent)]">✦</span>
        </p>
      </div>
    </footer>
  );
}
