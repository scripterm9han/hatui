"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Download, Eye, Play, Save, Trash2, X } from "lucide-react";

export default function JsonFormatter() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const handleFormat = (spaces: number = 2) => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, spaces);
      setOutput(formatted);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setOutput("");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setOutput("");
    }
  };

  const handleValidate = () => {
    if (!input.trim()) {
      setError("Input is empty.");
      return;
    }
    try {
      JSON.parse(input);
      setError(null);
      setOutput("✓ Valid JSON");
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setOutput("");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
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
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    const textToDownload = output || input;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          toolSlug: "json-formatter",
          inputRef: JSON.stringify({ raw: input.substring(0, 10000) }),
          outputRef: JSON.stringify({ formatted: (output || input).substring(0, 10000) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "json-formatter" }),
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
          >
            <Play className="h-3 w-3" />
            Format (2 Spaces)
          </button>
          <button
            onClick={() => handleFormat(4)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/5 border border-white/10 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 transition-all text-xs font-mono text-slate-300"
          >
            Format (4 Spaces)
          </button>
          <button
            onClick={handleMinify}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/5 border border-white/10 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 transition-all text-xs font-mono text-slate-300"
          >
            Minify JSON
          </button>
          <button
            onClick={handleValidate}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/5 border border-white/10 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 transition-all text-xs font-mono text-slate-300"
          >
            Validate JSON
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
            title="Clear Editor"
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
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!input || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono flex items-start gap-2 animate-pulse">
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error:</span> {error}
          </div>
        </div>
      )}

      {output === "✓ Valid JSON" && (
        <div className="p-3.5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-mono flex items-start gap-2">
          <Check className="h-4 w-4 shrink-0 mt-0.5" />
          <div>{output}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Input Raw JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='e.g. {"name": "Hatiyar", "version": 1.0, "isAwesome": true}'
            className="h-[450px] w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Formatted Output</label>
          <textarea
            value={output === "✓ Valid JSON" ? input : output}
            readOnly
            placeholder="Formatted output will appear here..."
            className="h-[450px] w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
