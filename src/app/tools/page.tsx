"use client";

import { useState } from "react";
import { Search, ArrowUpDown, LayoutGrid } from "lucide-react";
import { toolsList } from "@/lib/tools-data";
import { useSession } from "next-auth/react";
import AdBanner from "@/components/AdBanner";
import ToolCard from "@/components/ToolCard";

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
            {processedTools.map((tool, idx) => (
              <ToolCard key={tool.slug} tool={tool} index={idx} />
            ))}
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
