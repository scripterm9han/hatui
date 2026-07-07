import Link from "next/link";
import { ArrowRight, Star, Terminal, Zap, Shield, FileCheck, Flame, Braces, RefreshCw, QrCode, Binary } from "lucide-react";
import { toolsList } from "@/lib/tools-data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Hatiyar - Dynamic Multi-Tool Suite for Software Engineers",
  description: "Access a wide suite of fully functional developer utilities, real-time currency converters, and AI-powered Resume check and roasters. All SEO-optimized, dark-first, and lightning fast.",
};

// Map icon strings to Lucide icon components
const iconMap: Record<string, any> = {
  Binary: Binary,
  Braces: Braces,
  RefreshCw: RefreshCw,
  QrCode: QrCode,
  FileCheck: FileCheck,
  Flame: Flame,
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userPlan = session?.user ? (session.user as any).plan : "free";
  const totalTools = toolsList.length;

  return (
    <div className="min-h-screen pt-28 pb-24 relative">
      <div className="shell space-y-20 relative z-10">
        {/* Hero */}
        <section className="text-center space-y-7 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-white/[0.03] chip">
            <Terminal className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            Secure &amp; fully functional suite
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]">
            The Multi-Tool Arsenal for{" "}
            <span className="text-gradient">Engineers</span>
          </h1>
          <p className="text-[var(--color-fg-muted)] text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Stop opening 50 different browser tabs. Hatiyar houses your essential converters, regex parsers, QR engines, and flagship AI ATS resume scoring and roasting under one unified interface.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/tools" className="btn btn-primary btn-lg">
              Enter the Arsenal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">
              View Pro Pricing
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: `${totalTools}+`, label: "Verified Tools" },
            { value: "1.2M", label: "Monthly Executions" },
            { value: "< 50ms", label: "Client Latency" },
            { value: "99.99%", label: "API Uptime" },
          ].map((stat, i) => (
            <div key={i} className="surface rounded-xl p-5 text-center">
              <span className="block text-2xl md:text-3xl font-extrabold text-white font-mono">{stat.value}</span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-subtle)] mt-1.5">{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Featured Tools */}
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
            {toolsList.slice(0, 6).map((tool) => {
              const IconComp = iconMap[tool.icon] || Binary;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="surface surface-hover rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden h-[240px]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)]/5 blur-2xl rounded-full group-hover:bg-[var(--color-accent)]/15 transition-all duration-300" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-white/[0.04] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-fg-muted)] group-hover:text-[var(--color-accent)] group-hover:border-[var(--color-accent)]/40 transition-all">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-fg-subtle)] bg-white/[0.03] border border-[var(--color-border)] px-2 py-0.5 rounded-md">
                        {tool.monthlyUses} uses
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5">
                        {tool.name}
                        {tool.isAi && (
                          <span className="chip chip-violet">AI</span>
                        )}
                      </h3>
                      <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-auto">
                    <span className="text-[10px] font-mono text-[var(--color-fg-subtle)] uppercase tracking-wider">
                      {tool.category}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-fg-muted)] group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-1">
                      Launch
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {userPlan !== "pro" && (
            <div className="pt-4">
              <AdBanner layout="horizontal" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
