"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Calendar, FileText, ChevronDown, ChevronUp, Star, ShieldAlert, Sparkles, Zap, Flame, BarChart2 } from "lucide-react";
import { toolsList } from "@/lib/tools-data";

interface SavedHistoryItem {
  id: string;
  toolSlug: string;
  inputRef: string | null;
  outputRef: string | null;
  createdAt: Date;
}

interface DashboardClientProps {
  initialHistory: SavedHistoryItem[];
  userEmail: string;
  userName: string;
  userPlan: string;
  checkerUsageToday: number;
  roasterUsageToday: number;
  topTools: { slug: string; count: number }[];
}

export default function DashboardClient({
  initialHistory,
  userEmail,
  userName,
  userPlan,
  checkerUsageToday,
  roasterUsageToday,
  topTools,
}: DashboardClientProps) {
  const router = useRouter();
  const [history, setHistory] = useState<SavedHistoryItem[]>(initialHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved history item?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setHistory(history.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getToolName = (slug: string) => {
    return toolsList.find((t) => t.slug === slug)?.name || slug;
  };

  const getParsedExcerpt = (refString: string | null) => {
    if (!refString) return "None";
    try {
      const parsed = JSON.parse(refString);
      if (typeof parsed === "object") {
        if (parsed.raw) return parsed.raw.substring(0, 150) + "...";
        if (parsed.textExcerpt) return parsed.textExcerpt;
        if (parsed.regex) return `/${parsed.regex}/${parsed.flags || ""}`;
        if (parsed.value) return `${parsed.value} ${parsed.fromUnit || ""}`;
        if (parsed.text) return parsed.text;
      }
      return String(refString).substring(0, 150);
    } catch {
      return refString.substring(0, 150);
    }
  };

  const getOutputPreview = (refString: string | null) => {
    if (!refString) return "None";
    try {
      const parsed = JSON.parse(refString);
      if (typeof parsed === "object") {
        if (parsed.formatted) return parsed.formatted.substring(0, 400);
        if (parsed.roast) return parsed.roast;
        if (parsed.score !== undefined) {
          return `ATS Score: ${parsed.score}% | Format: ${parsed.formatScore}% | Keywords: ${parsed.keywordScore}%`;
        }
        if (parsed.result !== undefined) return `Result: ${parsed.result} ${parsed.toUnit || ""}`;
      }
      return String(refString).substring(0, 400);
    } catch {
      return refString.substring(0, 400);
    }
  };

  // Profile banner color theme
  const bannerRgb = userPlan === "pro" ? "139, 92, 246" : "16, 185, 129"; // Purple vs Emerald

  return (
    <div className="space-y-8">
      {/* Top Banner with plan metadata & Glowing aesthetics */}
      <div 
        className="relative rounded-2xl border bg-black/45 backdrop-blur-md p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300"
        style={{
          boxShadow: `0 0 30px -8px rgba(${bannerRgb}, 0.22), inset 0 0 12px rgba(${bannerRgb}, 0.06)`,
          borderColor: `rgba(${bannerRgb}, 0.3)`,
        }}
      >
        {/* Soft atmospheric light leaks */}
        <div 
          className="absolute pointer-events-none -z-10 rounded-full blur-[60px]"
          style={{
            top: "-30px",
            left: "-30px",
            width: "180px",
            height: "180px",
            background: `radial-gradient(circle, rgba(${bannerRgb}, 0.2) 0%, rgba(${bannerRgb}, 0) 70%)`
          }}
        />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white">Welcome, {userName || userEmail}</h2>
            {userPlan === "pro" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                <Star className="h-3 w-3 fill-current" />
                Pro Member
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                Free User
              </span>
            )}
          </div>
          <p className="text-[var(--color-fg-muted)] text-sm">Account email: {userEmail}</p>
        </div>

        {userPlan !== "pro" && (
          <button
            onClick={() => router.push("/pricing")}
            className="btn btn-primary btn-md z-10 shadow-[0_0_20px_rgba(0,255,135,0.25)] hover:shadow-[0_0_30px_rgba(0,255,135,0.45)] hover:scale-105 transition-all duration-300"
          >
            <Zap className="h-4.5 w-4.5" />
            Upgrade to Pro • ₹299/mo
          </button>
        )}
      </div>

      {/* Stats Meters grid with dynamic glows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Checker Meter */}
        <div 
          className="relative rounded-xl border bg-black/45 backdrop-blur-md p-6 space-y-4 transition-all duration-300 hover:scale-[1.02]"
          style={{
            boxShadow: `0 0 25px -8px rgba(6, 182, 212, 0.18), inset 0 0 10px rgba(6, 182, 212, 0.05)`,
            borderColor: `rgba(6, 182, 212, 0.25)`,
          }}
        >
          {/* Light leak top-left */}
          <div 
            className="absolute pointer-events-none -z-10 rounded-full blur-[40px]"
            style={{
              top: "-20px",
              left: "-20px",
              width: "120px",
              height: "120px",
              background: `radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%)`
            }}
          />

          <div className="flex justify-between items-center relative z-10">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">ATS Checker Usage</h4>
            <span className="text-xs font-mono font-bold text-white">
              {checkerUsageToday} / {userPlan === "pro" ? "∞" : "10"} today
            </span>
          </div>
          <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-cyan-500/20 p-[2px]">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${Math.min((checkerUsageToday / 10) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-[var(--color-fg-subtle)] relative z-10">
            {userPlan === "pro" ? "You have unlimited AI scans." : "Resets daily. Pro has unlimited checks."}
          </p>
        </div>

        {/* Resume Roaster Meter */}
        <div 
          className="relative rounded-xl border bg-black/45 backdrop-blur-md p-6 space-y-4 transition-all duration-300 hover:scale-[1.02]"
          style={{
            boxShadow: `0 0 25px -8px rgba(244, 63, 94, 0.18), inset 0 0 10px rgba(244, 63, 94, 0.05)`,
            borderColor: `rgba(244, 63, 94, 0.25)`,
          }}
        >
          {/* Light leak top-left */}
          <div 
            className="absolute pointer-events-none -z-10 rounded-full blur-[40px]"
            style={{
              top: "-20px",
              left: "-20px",
              width: "120px",
              height: "120px",
              background: `radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0) 70%)`
            }}
          />

          <div className="flex justify-between items-center relative z-10">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-rose-400">AI Roaster Usage</h4>
            <span className="text-xs font-mono font-bold text-white">
              {roasterUsageToday} / {userPlan === "pro" ? "∞" : "5"} today
            </span>
          </div>
          <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-rose-500/20 p-[2px]">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
              style={{ width: `${Math.min((roasterUsageToday / 5) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-[var(--color-fg-subtle)] relative z-10">
            {userPlan === "pro" ? "You have unlimited AI roasts." : "Resets daily. Pro has unlimited checks."}
          </p>
        </div>

        {/* Most-Used Tool Ranking */}
        <div 
          className="relative rounded-xl border bg-black/45 backdrop-blur-md p-6 space-y-4 transition-all duration-300 hover:scale-[1.02]"
          style={{
            boxShadow: `0 0 25px -8px rgba(245, 158, 11, 0.18), inset 0 0 10px rgba(245, 158, 11, 0.05)`,
            borderColor: `rgba(245, 158, 11, 0.25)`,
          }}
        >
          {/* Light leak top-left */}
          <div 
            className="absolute pointer-events-none -z-10 rounded-full blur-[40px]"
            style={{
              top: "-20px",
              left: "-20px",
              width: "120px",
              height: "120px",
              background: `radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)`
            }}
          />

          <h4 className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 relative z-10">
            <BarChart2 className="h-4 w-4" />
            Top Used Arsenal
          </h4>
          {topTools.length > 0 ? (
            <div className="space-y-2 max-h-24 overflow-y-auto relative z-10 pr-1">
              {topTools.map((tool, index) => (
                <div key={tool.slug} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[var(--color-fg-muted)] truncate max-w-[150px] hover:text-white transition-colors">
                    {index + 1}. {getToolName(tool.slug)}
                  </span>
                  <span className="text-amber-400 font-bold">{tool.count} times</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[var(--color-fg-subtle)] py-2 relative z-10">No usage logs recorded yet.</p>
          )}
        </div>
      </div>

      {/* Saved History Lists */}
      <div 
        className="relative rounded-xl border bg-black/45 backdrop-blur-md p-6 transition-all duration-300"
        style={{
          boxShadow: `0 0 30px -8px rgba(139, 92, 246, 0.18), inset 0 0 12px rgba(139, 92, 246, 0.05)`,
          borderColor: `rgba(139, 92, 246, 0.25)`,
        }}
      >
        {/* Light leak corner */}
        <div 
          className="absolute pointer-events-none -z-10 rounded-full blur-[50px]"
          style={{
            bottom: "-30px",
            right: "-30px",
            width: "150px",
            height: "150px",
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)`
          }}
        />

        <h3 className="text-lg font-semibold text-white mb-4 flex flex-wrap items-center gap-2 border-b border-white/[0.04] pb-4 relative z-10">
          <FileText className="h-5 w-5 text-purple-400" />
          Saved Output History
          {userPlan !== "pro" && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 ml-auto">
              Free rolling limit: {history.length} / 20 saved per tool
            </span>
          )}
        </h3>

        {history.length > 0 ? (
          <div className="divide-y divide-white/[0.04] relative z-10">
            {history.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="flex-1 min-w-0 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {getToolName(item.toolSlug)}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-fg-subtle)] font-mono">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-purple-400/80" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-sm hidden sm:inline">
                          Excerpt: {getParsedExcerpt(item.inputRef)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[var(--color-fg-subtle)] group-hover:text-purple-400 ml-2 shrink-0 transition-colors">
                      {expandedId === item.id ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="btn btn-danger-ghost btn-sm shrink-0 border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 hover:border-red-500/40 text-red-400"
                    title="Delete Saved Output"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {expandedId === item.id && (
                  <div className="mt-4 p-4 rounded-xl border border-white/[0.06] bg-black/60 space-y-4 animate-fade-in font-mono text-xs text-[var(--color-fg-muted)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-purple-400 uppercase tracking-wider text-[10px] mb-1.5 font-bold">Saved Input</span>
                        <pre className="p-3 rounded-lg bg-black/40 overflow-x-auto whitespace-pre-wrap max-h-45 border border-white/[0.04]">
                          {item.inputRef ? JSON.stringify(JSON.parse(item.inputRef), null, 2) : "None"}
                        </pre>
                      </div>
                      <div>
                        <span className="block text-purple-400 uppercase tracking-wider text-[10px] mb-1.5 font-bold">Saved Output</span>
                        <pre className="p-3 rounded-lg bg-black/40 overflow-x-auto whitespace-pre-wrap max-h-45 border border-white/[0.04] text-[var(--color-accent)]">
                          {item.outputRef && item.toolSlug !== "resume-roaster"
                            ? JSON.stringify(JSON.parse(item.outputRef), null, 2)
                            : getOutputPreview(item.outputRef)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--color-fg-subtle)] text-sm font-mono relative z-10">
            No saved history found. Use tools and hit the "Save Output" button.
          </div>
        )}
      </div>
    </div>
  );
}
