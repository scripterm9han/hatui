"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2, ArrowUpDown } from "lucide-react";

export default function LineSorter() {
  const { data: session } = useSession();
  const [input, setInput] = useState("banana\napple\nbanana\ncherry\n\napple");
  const [output, setOutput] = useState("");
  const [removeDupes, setRemoveDupes] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "length">("asc");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const processLines = () => {
    if (!input) return;
    
    let lines = input.split("\n");

    if (removeEmpty) {
      lines = lines.filter((l) => l.trim() !== "");
    }

    if (removeDupes) {
      lines = Array.from(new Set(lines));
    }

    if (sortOrder === "asc") {
      lines.sort((a, b) => a.localeCompare(b));
    } else if (sortOrder === "desc") {
      lines.sort((a, b) => b.localeCompare(a));
    } else if (sortOrder === "length") {
      lines.sort((a, b) => a.length - b.length);
    }

    setOutput(lines.join("\n"));
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
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
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "line-sorter",
          inputRef: JSON.stringify({ sortOrder }),
          outputRef: JSON.stringify({ linesCount: output.split("\n").length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "line-sorter" }),
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
        {/* Sorting options */}
        <div className="flex flex-wrap gap-3 items-center text-xs font-mono text-slate-400">
          <button
            onClick={processLines}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort & Clean
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={removeDupes}
              onChange={(e) => setRemoveDupes(e.target.checked)}
              className="rounded border-slate-800 bg-black text-neon-cyan focus:ring-0"
            />
            Deduplicate
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={(e) => setRemoveEmpty(e.target.checked)}
              className="rounded border-slate-800 bg-black text-neon-cyan focus:ring-0"
            />
            Remove Empty
          </label>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="h-9 px-2 rounded-lg bg-black border border-slate-800 text-[11px]"
          >
            <option value="asc">A to Z Ascending</option>
            <option value="desc">Z to A Descending</option>
            <option value="length">Shortest to Longest</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Output"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!input || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Raw Input Lines</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-64 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Sorted & Cleaned Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="h-64 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
