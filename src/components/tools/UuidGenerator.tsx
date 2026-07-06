"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, RefreshCw, Save, Trash2 } from "lucide-react";

export default function UuidGenerator() {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const generateUUIDs = () => {
    const list: string[] = [];
    const count = Math.min(Math.max(1, quantity), 100);

    for (let i = 0; i < count; i++) {
      let uuid = "";
      if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
        uuid = window.crypto.randomUUID();
      } else {
        // Fallback standard math-based v4 UUID generator
        uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }

      if (!hyphens) {
        uuid = uuid.replace(/-/g, "");
      }
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }
      list.push(uuid);
    }
    setOutput(list.join("\n"));
  };

  useEffect(() => {
    generateUUIDs();
  }, []);

  const handleClear = () => {
    setOutput("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
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
    if (!output) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "uuid-generator",
          inputRef: JSON.stringify({ quantity, uppercase, hyphens }),
          outputRef: JSON.stringify({ count: quantity, uuidsExcerpt: output.substring(0, 500) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "uuid-generator" }),
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Count:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-16 h-9 px-2 rounded-lg mono-input text-xs text-center"
            />
          </div>

          <label className="flex items-center gap-2 text-slate-300 text-xs font-mono cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded bg-black border-white/10 text-neon-cyan focus:ring-0"
            />
            Uppercase
          </label>

          <label className="flex items-center gap-2 text-slate-300 text-xs font-mono cursor-pointer">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded bg-black border-white/10 text-neon-cyan focus:ring-0"
            />
            Include Hyphens
          </label>
          
          <button
            onClick={generateUUIDs}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Generate UUIDs
          </button>
        </div>

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
            disabled={!output}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy UUIDs"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!output || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Generated UUID List</label>
        <textarea
          value={output}
          readOnly
          className="h-80 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
