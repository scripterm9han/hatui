"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function JsonXml() {
  const { data: session } = useSession();
  const [input, setInput] = useState('{\n  "note": {\n    "to": "Tove",\n    "from": "Jani",\n    "heading": "Reminder",\n    "body": "Don\'t forget me this weekend!"\n  }\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const convertJsonToXml = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      const obj = JSON.parse(input);
      
      const toXml = (val: any, nodeName = "root", indent = ""): string => {
        if (val === null || val === undefined) return `${indent}<${nodeName} />`;
        
        if (typeof val !== "object") {
          // Clean XML entities
          const escaped = ("" + val)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `${indent}<${nodeName}>${escaped}</${nodeName}>`;
        }

        if (Array.isArray(val)) {
          return val.map((item) => toXml(item, nodeName, indent)).join("\n");
        }

        let res = `${indent}<${nodeName}>\n`;
        Object.keys(val).forEach((key) => {
          res += toXml(val[key], key, indent + "  ") + "\n";
        });
        res += `${indent}</${nodeName}>`;
        return res;
      };

      const rootName = Object.keys(obj).length === 1 ? Object.keys(obj)[0] : "root";
      const rootVal = Object.keys(obj).length === 1 ? obj[rootName] : obj;

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` + toXml(rootVal, rootName);
      setOutput(xml);
    } catch (err: any) {
      setError(err.message || "Failed to convert JSON to XML.");
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
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "json-xml",
          inputRef: JSON.stringify({ size: input.length }),
          outputRef: JSON.stringify({ size: output.length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "json-xml" }),
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
        <button
          onClick={convertJsonToXml}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <Play className="h-3.5 w-3.5" />
          JSON to XML
        </button>

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
            {copied ? "Copied" : "Copy XML"}
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

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">JSON Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">XML Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="XML string will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
