"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Binary, Braces, RefreshCw, QrCode, FileCheck, Flame, ArrowUpDown, LayoutGrid, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen pt-28 pb-20">
      <div className="shell space-y-8 relative z-10">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutGrid className="h-7 w-7 text-[var(--color-accent)]" />
            Engineering <span className="text-[var(--color-accent)] font-mono">Tools Directory</span>
          </h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-1.5">
            Browse, search, and sort our complete suite of {toolsList.length} production-grade tools.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="surface rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
                  category === cat
                    ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)] font-bold"
                    : "bg-transparent border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-white"
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
                className="field h-9 pl-9 pr-4 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-fg-subtle)]" />
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="field h-9 pl-8 pr-3 text-sm appearance-none cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-fg-subtle)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dynamic Tools Grid */}
        {processedTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedTools.map((tool) => {
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
                        #{100 - tool.popularity}
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
                    <span className="text-xs font-mono text-[var(--color-accent)] flex items-center gap-1">
                      Launch Tool
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 surface rounded-xl text-[var(--color-fg-muted)] text-sm font-mono">
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
