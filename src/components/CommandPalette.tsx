"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Terminal, ArrowUp, ArrowDown, CornerDownLeft, Shield } from "lucide-react";
import { toolsList } from "@/lib/tools-data";

/**
 * Premium Spotlight Search Command Palette (Ctrl+K / Cmd+K).
 * Allows engineers to quickly search, filter, and keyboard-navigate between the developer tools.
 */
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Filter tools based on query
  const filtered = toolsList.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 2. Global Keyboard Shortcut Listener (Ctrl+K / Cmd+K / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
      }

      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 3. Navigation Arrow Keys & Enter Handlers
  useEffect(() => {
    if (!open) return;

    const handleNavKeys = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          router.push(`/tools/${filtered[selectedIndex].slug}`);
          setOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleNavKeys);
    return () => window.removeEventListener("keydown", handleNavKeys);
  }, [open, filtered, selectedIndex, router]);

  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-start justify-center pt-24 px-4"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border border-[var(--color-border-strong)] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Search Input block */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] relative">
          <Search className="h-4.5 w-4.5 text-[var(--color-fg-subtle)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools, actions, category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-white text-sm font-mono placeholder-[var(--color-fg-subtle)]"
          />
          <span className="text-[10px] font-mono text-[var(--color-fg-subtle)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-1.5 py-0.5 rounded select-none shrink-0">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((tool, idx) => (
              <div
                key={tool.slug}
                onClick={() => {
                  router.push(`/tools/${tool.slug}`);
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  selectedIndex === idx
                    ? "bg-[var(--color-accent-soft)] border-l-2 border-[var(--color-accent)] text-[var(--color-accent)] pl-4"
                    : "bg-transparent text-[var(--color-fg-muted)] pl-3"
                }`}
              >
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-white truncate">
                    {tool.name}
                  </span>
                  <span className="block text-[11px] text-[var(--color-fg-subtle)] truncate max-w-sm">
                    {tool.description}
                  </span>
                </div>

                {selectedIndex === idx && (
                  <span className="text-[9px] font-mono text-[var(--color-accent)] flex items-center gap-0.5 shrink-0 select-none">
                    Navigate
                    <CornerDownLeft className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[var(--color-fg-subtle)] text-xs font-mono">
              No matching tools found.
            </div>
          )}
        </div>

        {/* Command Palette Keyboard Controls Guide Footer */}
        <div className="bg-[var(--color-bg-elevated)] px-4 py-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] font-mono text-[var(--color-fg-subtle)]">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-[var(--color-accent)]" />
            <span>Hatiyar command launcher</span>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-0.5">
              <ArrowUp className="h-2.5 w-2.5" />
              <ArrowDown className="h-2.5 w-2.5" />
              Navigate
            </span>
            <span className="flex items-center gap-0.5">
              <CornerDownLeft className="h-2.5 w-2.5" />
              Select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
