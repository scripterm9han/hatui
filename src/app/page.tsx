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
    <div className="min-h-screen bg-bg-dark grid-bg pt-28 pb-20 relative">
      {/* Dynamic top-center atmospheric glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-violet/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 space-y-16 relative z-10">
        
        {/* Cinematic Hero Title Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan text-xs font-mono tracking-wider uppercase">
            <Terminal className="h-3.5 w-3.5" />
            Phase 1 MVP Active
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-sans leading-tight">
            The Multi-Tool Arsenal for <span className="text-neon-cyan font-mono drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">Engineers</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-sans">
            Stop opening 50 different browser tabs. Hatiyar houses your essential converters, regex parsers, QR engines, and flagship AI ATS resume scoring and roasting under one unified, cinematic interface.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/tools"
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-neon-cyan text-black hover:bg-neon-cyan/85 font-bold transition-all text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.25)]"
            >
              Enter the Arsenal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 h-11 px-6 rounded-xl border border-slate-800 hover:border-neon-cyan/30 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all text-xs font-mono"
            >
              View Pro Pricing
            </Link>
          </div>
        </div>

        {/* Global Statistics Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { value: `${totalTools}+`, label: "MVP Tools" },
            { value: "1.2M", label: "Monthly Executions" },
            { value: "< 50ms", label: "Client Latency" },
            { value: "99.99%", label: "API Uptime" },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl border border-border-card/50 p-5 text-center">
              <span className="block text-2xl md:text-3xl font-extrabold text-white font-mono">{stat.value}</span>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Featured Tools Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
              <Zap className="h-5 w-5 text-neon-cyan" />
              Featured Arsenal
            </h2>
            <Link href="/tools" className="text-xs font-mono text-neon-cyan hover:underline flex items-center gap-1">
              View All {totalTools} Tools
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsList.slice(0, 6).map((tool) => {
              const IconComp = iconMap[tool.icon] || Binary;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="glass-card rounded-2xl border border-border-card p-6 flex flex-col justify-between group relative overflow-hidden h-[240px]"
                >
                  {/* Subtle hover glow accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-2xl rounded-full group-hover:bg-neon-cyan/15 transition-all duration-300" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-neon-cyan group-hover:border-neon-cyan/30 transition-all shadow-inner">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                        {tool.monthlyUses} monthly uses
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors font-sans flex items-center gap-1.5">
                        {tool.name}
                        {tool.isAi && (
                          <span className="text-[9px] font-mono text-neon-violet font-semibold uppercase tracking-wider bg-neon-violet/10 border border-neon-violet/20 px-1.5 py-0.2 rounded">
                            AI
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-auto">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      {tool.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 group-hover:text-neon-cyan transition-colors flex items-center gap-1">
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
        </div>

      </div>
    </div>
  );
}
