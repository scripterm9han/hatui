import Link from "next/link";
import { ArrowRight, Terminal, Zap, Users, Shield, Timer, Lock } from "lucide-react";
import { toolsList } from "@/lib/tools-data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdBanner from "@/components/AdBanner";
import ToolCard from "@/components/ToolCard";

export const metadata = {
  title: "Hatiyar - Dynamic Multi-Tool Suite for Software Engineers",
  description: "Access a wide suite of fully functional developer utilities, real-time currency converters, and AI-powered Resume check and roasters. All SEO-optimized, dark-first, and lightning fast.",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userPlan = session?.user ? (session.user as any).plan : "free";
  const totalTools = toolsList.length;

  return (
    <div className="min-h-screen pt-28 pb-24 relative">
      <div className="shell space-y-20 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-7 max-w-3xl mx-auto relative pt-8 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white/[0.03] chip shadow-[0_0_15px_var(--color-accent-glow)]">
            <Terminal className="h-3.5 w-3.5 text-[var(--color-accent)] animate-pulse" />
            Secure &amp; fully functional suite
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            The Multi-Tool Arsenal for{" "}
            <span className="text-gradient">Engineers</span>
          </h1>
          
          <p className="text-[var(--color-fg-muted)] text-base md:text-lg leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            Stop opening 50 different browser tabs. Hatiyar houses your essential converters, regex parsers, QR engines, and flagship AI ATS resume scoring and roasting under one unified interface.
          </p>
          
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/tools" className="btn btn-primary btn-lg shadow-[0_0_20px_rgba(0,255,135,0.25)] hover:shadow-[0_0_30px_rgba(0,255,135,0.45)] transition-all">
              Enter the Arsenal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">
              View Pro Pricing
            </Link>
          </div>
        </section>

        {/* Featured Tools Grid */}
        <section className="space-y-6">
          <div className="section-head">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-[var(--color-accent)]" />
              Featured Arsenal
            </h2>
            <Link href="/tools" className="text-xs font-mono text-[var(--color-accent)] hover:underline flex items-center gap-1">
              View All {totalTools} Tools
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {toolsList.slice(0, 6).map((tool, idx) => (
              <ToolCard key={tool.slug} tool={tool} index={idx} />
            ))}
          </div>

          {userPlan !== "pro" && (
            <div className="pt-4">
              <AdBanner layout="horizontal" />
            </div>
          )}
        </section>

        {/* Statistics Bar at the bottom */}
        <section className="bg-black/35 backdrop-blur-md border border-white/[0.05] rounded-2xl p-6 md:p-8 w-full max-w-5xl mx-auto flex flex-wrap items-center justify-around gap-6 text-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold text-white leading-tight font-mono">1M+</span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-subtle)]">Tools Used</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/[0.06] hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold text-white leading-tight font-mono">250K+</span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-subtle)]">Happy Users</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/[0.06] hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold text-white leading-tight font-mono">99.9%</span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-subtle)]">Uptime</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/[0.06] hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Timer className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold text-white leading-tight font-mono">&lt;1ms</span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-subtle)]">Super Fast</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/[0.06] hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Lock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold text-white leading-tight font-mono">100%</span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-subtle)]">Secure</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
