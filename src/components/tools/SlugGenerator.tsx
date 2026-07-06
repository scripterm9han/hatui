"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2 } from "lucide-react";

export default function SlugGenerator() {
  const { data: session } = useSession();
  const [input, setInput] = useState("Hello World, Hatiyar Suite 2026!");
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const generateSlug = (val: string) => {
    const clean = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove special characters
      .replace(/[\s_-]+/g, "-") // replace spaces/underscores/dashes with a single dash
      .replace(/^-+|-+$/g, ""); // remove leading/trailing dashes
    setSlug(clean);
  };

  useEffect(() => {
    generateSlug(input);
  }, [input]);

  const handleClear = () => {
    setInput("");
    setSlug("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs to your dashboard.");
      return;
    }
    if (!slug) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "slug-generator",
          inputRef: JSON.stringify({ inputExcerpt: input.substring(0, 50) }),
          outputRef: JSON.stringify({ slug }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "slug-generator" }),
        });
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          URL-Friendly Router Slugs
        </h4>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!slug}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Slug"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!slug || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Raw Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your title or string here..."
            className="h-36 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Generated Slug Output</label>
          <div className="relative">
            <input
              type="text"
              value={slug}
              readOnly
              placeholder="Slug will appear here..."
              className="w-full h-11 px-4 rounded-xl mono-input text-xs bg-black/60 border-white/5 text-neon-cyan font-bold font-mono"
            />
            <span className="absolute right-3 top-3.5 text-[9px] font-mono text-slate-500">
              Length: {slug.length} chars
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
