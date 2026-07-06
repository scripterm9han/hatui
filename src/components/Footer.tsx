import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-bg-darker border-t border-border-card py-12 px-4 md:px-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand Information */}
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Shield className="h-4 w-4 text-neon-cyan" />
            </div>
            <span className="text-white font-bold font-mono tracking-wider text-sm">HATIYAR.IN</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            A production-grade, fast, multi-tool engineer's arsenal. Formatter, converters, AI resume engines, and utility modules built for speed and visual excellence.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-xs font-mono uppercase tracking-wider text-slate-400">
          <div className="space-y-3">
            <span className="block text-white font-semibold">Workspace</span>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="hover:text-neon-cyan transition-colors">
                  Tools Directory
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-neon-cyan transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <span className="block text-white font-semibold">Legal</span>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-neon-cyan transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neon-cyan transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600">
        <p>© {new Date().getFullYear()} Hatiyar. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed for developers with <span className="text-neon-cyan animate-pulse">⚡</span>
        </p>
      </div>
    </footer>
  );
}
