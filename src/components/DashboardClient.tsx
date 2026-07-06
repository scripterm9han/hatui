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

  return (
    <div className="space-y-8">
      {/* Top Banner with plan metadata */}
      <div className="glass-card rounded-2xl border border-border-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Welcome, {userName || userEmail}</h2>
            {userPlan === "pro" ? (
              <span className="px-2.5 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <Star className="h-3 w-3 fill-neon-cyan" />
                PRO MEMBER
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
                FREE USER
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">Account email: {userEmail}</p>
        </div>

        {userPlan !== "pro" && (
          <button
            onClick={() => router.push("/pricing")}
            className="flex items-center gap-2 h-11 px-5 rounded-xl bg-neon-cyan text-black hover:bg-neon-cyan/85 font-bold transition-all text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.25)] z-10"
          >
            <Zap className="h-4.5 w-4.5 fill-black" />
            Upgrade to Pro • ₹299/mo
          </button>
        )}
      </div>

      {/* Stats Meters grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Checker Meter */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">ATS Checker Usage</h4>
            <span className="text-xs font-mono font-bold text-white">
              {checkerUsageToday} / {userPlan === "pro" ? "∞" : "10"} today
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-neon-cyan rounded-full transition-all duration-500"
              style={{ width: `${Math.min((checkerUsageToday / 10) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            {userPlan === "pro" ? "You have unlimited AI scans." : "Resets daily. Pro has unlimited checks."}
          </p>
        </div>

        {/* Resume Roaster Meter */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">AI Roaster Usage</h4>
            <span className="text-xs font-mono font-bold text-white">
              {roasterUsageToday} / {userPlan === "pro" ? "∞" : "5"} today
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-neon-violet rounded-full transition-all duration-500"
              style={{ width: `${Math.min((roasterUsageToday / 5) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            {userPlan === "pro" ? "You have unlimited AI roasts." : "Resets daily. Pro has unlimited checks."}
          </p>
        </div>

        {/* Most-Used Tool Ranking */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-neon-cyan" />
            Top Used Arsenal
          </h4>
          {topTools.length > 0 ? (
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {topTools.map((tool, index) => (
                <div key={tool.slug} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 truncate max-w-[150px]">
                    {index + 1}. {getToolName(tool.slug)}
                  </span>
                  <span className="text-neon-cyan font-bold">{tool.count} times</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-500 py-2">No usage logs recorded yet.</p>
          )}
        </div>
      </div>

      {/* Saved History Lists */}
      <div className="glass-card rounded-xl border border-border-card p-6">
        <h3 className="text-lg font-semibold text-white font-sans mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-neon-cyan" />
          Saved Output History
          {userPlan !== "pro" && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              Free rolling limit: {history.length} / 20 saved per tool
            </span>
          )}
        </h3>

        {history.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {history.map((item) => (
              <div key={item.id} className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="flex-1 min-w-0 cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white hover:text-neon-cyan transition-colors">
                        {getToolName(item.toolSlug)}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-sm hidden sm:inline">
                          Excerpt: {getParsedExcerpt(item.inputRef)}
                        </span>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-neon-cyan ml-2 shrink-0">
                      {expandedId === item.id ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 rounded-lg border border-slate-850 hover:border-red-500/30 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all shrink-0"
                    title="Delete Saved Output"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {expandedId === item.id && (
                  <div className="mt-4 p-4 rounded-xl border border-slate-850 bg-bg-darker/60 space-y-4 animate-fadeIn font-mono text-xs text-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-slate-500 uppercase tracking-wider text-[10px] mb-1">Saved Input</span>
                        <pre className="p-3 rounded bg-black/60 overflow-x-auto whitespace-pre-wrap max-h-40 border border-white/5">
                          {item.inputRef ? JSON.stringify(JSON.parse(item.inputRef), null, 2) : "None"}
                        </pre>
                      </div>
                      <div>
                        <span className="block text-slate-500 uppercase tracking-wider text-[10px] mb-1">Saved Output</span>
                        <pre className="p-3 rounded bg-black/60 overflow-x-auto whitespace-pre-wrap max-h-40 border border-white/5 text-neon-cyan">
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
          <div className="text-center py-12 text-slate-500 text-sm font-mono">
            No saved history found. Use tools and hit the "Save Output" button.
          </div>
        )}
      </div>
    </div>
  );
}
