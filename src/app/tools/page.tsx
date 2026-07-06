"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Binary, Braces, RefreshCw, QrCode, FileCheck, Flame, ArrowUpDown, LayoutGrid } from "lucide-react";
import { toolsList } from "@/lib/tools-data";
import { useSession } from "next-auth/react";
import AdBanner from "@/components/AdBanner";

// Map icon strings to Lucide components
const iconMap: Record<string, any> = {
  Binary: Binary,
  Braces: Braces,
  RefreshCw: RefreshCw,
  QrCode: QrCode,
  FileCheck: FileCheck,
  Flame: Flame,
};

type SortOption = "popularity" | "alphabetical";

export default function ToolsIndexPage() {
  const { data: session } = useSession();
  const userPlan = session?.user ? (session.user as any).plan : "free";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");

  // Get unique categories list
  const categories = ["all", ...Array.from(new Set(toolsList.map((t) => t.category)))];

  // Filter and sort tools list
  const processedTools = toolsList
    .filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || tool.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      return b.popularity - a.popularity; // Default: Popularity desc
    });

  return (
    <div className="min-h-screen bg-bg-dark grid-bg pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <LayoutGrid className="h-7 w-7 text-neon-cyan" />
            Engineering <span className="text-neon-cyan font-mono">Tools Directory</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse, search, and sort our complete suite of {toolsList.length} production-grade tools.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="glass-card rounded-xl border border-border-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
                  category === cat
                    ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search index..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg mono-input text-xs"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 pl-8 pr-3 rounded-lg mono-input text-xs bg-black/80"
              >
                <option value="popularity">Popularity</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Dynamic Tools Grid */}
        {processedTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedTools.map((tool) => {
              const IconComp = iconMap[tool.icon] || Binary;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="glass-card rounded-2xl border border-border-card p-6 flex flex-col justify-between group relative overflow-hidden h-[240px] hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-2xl rounded-full group-hover:bg-neon-cyan/15 transition-all duration-300" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-neon-cyan group-hover:border-neon-cyan/30 transition-all">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                        Popularity: #{100 - tool.popularity}
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
                    <span className="text-xs font-mono text-neon-cyan transition-colors flex items-center gap-1">
                      Launch Tool
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-xl border border-border-card text-slate-500 text-sm font-mono">
            No engineering tools found matching your search.
          </div>
        )}

        {userPlan !== "pro" && (
          <AdBanner layout="horizontal" />
        )}
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
