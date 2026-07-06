"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2 } from "lucide-react";

export default function StringUtility() {
  const { data: session } = useSession();
  const [input, setInput] = useState("  Welcome to   Hatiyar   \n\n\nThis is a helper tool.  ");
  const [output, setOutput] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const runUtility = (action: "trim" | "remove_spaces" | "remove_newlines" | "replace") => {
    if (!input) return;
    
    let res = input;
    switch (action) {
      case "trim":
        res = input.trim();
        break;
      case "remove_spaces":
        res = input.replace(/\s+/g, " ").trim();
        break;
      case "remove_newlines":
        res = input.split("\n").map((l) => l.trim()).filter((l) => l !== "").join("\n");
        break;
      case "replace":
        if (findText) {
          // Escape regex characters
          const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          res = input.replace(new RegExp(escapedFind, "g"), replaceText);
        }
        break;
    }
    setOutput(res);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setFindText("");
    setReplaceText("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2050);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs to your dashboard.");
      return;
    }
    if (!input.trim()) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "string-utility",
          inputRef: JSON.stringify({ length: input.length }),
          outputRef: JSON.stringify({ length: output.length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "string-utility" }),
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
        {/* String operations */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => runUtility("trim")}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all uppercase tracking-wider"
          >
            Trim Outer
          </button>
          <button
            onClick={() => runUtility("remove_spaces")}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all uppercase tracking-wider"
          >
            Collapse Spaces
          </button>
          <button
            onClick={() => runUtility("remove_newlines")}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all uppercase tracking-wider"
          >
            Strip Empty Lines
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
            disabled={!output && !input}
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

      {/* Find & Replace Controls */}
      <div className="glass-card rounded-xl border border-border-card p-4 flex gap-4 bg-bg-darker/20">
        <div className="flex-1 flex flex-col space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase">Find String</label>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="e.g. Hatiyar"
            className="h-9 px-3 rounded-lg mono-input text-xs"
          />
        </div>
        <div className="flex-1 flex flex-col space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase">Replace with</label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="e.g. Tool Suite"
            className="h-9 px-3 rounded-lg mono-input text-xs"
          />
        </div>
        <button
          onClick={() => runUtility("replace")}
          className="px-4 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono self-end"
        >
          Replace All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Raw Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-60 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Processed Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Click operation buttons above..."
            className="h-60 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
