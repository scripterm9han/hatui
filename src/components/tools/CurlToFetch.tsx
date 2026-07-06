"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function CurlToFetch() {
  const { data: session } = useSession();
  const [input, setInput] = useState(`curl -X POST "https://api.hatiyar.in/v1/data" \\
  -H "Authorization: Bearer mock-token-abc" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "trending tools"}'`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const convertCurlToFetch = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      const curl = input.trim();
      
      // 1. Extract URL
      const urlMatch = curl.match(/(?:https?:\/\/[^\s"']+)/);
      if (!urlMatch) {
        throw new Error("Could not find a valid target URL starting with http:// or https:// in the cURL command.");
      }
      const url = urlMatch[0];

      // 2. Extract Method
      let method = "GET";
      const methodMatch = curl.match(/-X\s+([A-Z]+)|--request\s+([A-Z]+)/);
      if (methodMatch) {
        method = methodMatch[1] || methodMatch[2];
      }

      // 3. Extract Headers
      const headers: Record<string, string> = {};
      const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
      let match;
      while ((match = headerRegex.exec(curl)) !== null) {
        const headerParts = match[1].split(":");
        if (headerParts.length >= 2) {
          const name = headerParts[0].trim();
          const val = headerParts.slice(1).join(":").trim();
          headers[name] = val;
        }
      }

      // 4. Extract Body Data
      let body = "";
      const bodyMatch = curl.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"]/);
      if (bodyMatch) {
        body = bodyMatch[1].trim();
        // If method was default, change to POST
        if (method === "GET") method = "POST";
      }

      // 5. Construct Fetch String
      let fetchStr = `fetch("${url}", {\n  method: "${method}",\n`;
      
      if (Object.keys(headers).length > 0) {
        fetchStr += `  headers: {\n`;
        Object.entries(headers).forEach(([name, val]) => {
          fetchStr += `    "${name}": "${val}",\n`;
        });
        fetchStr += `  },\n`;
      }
      
      if (body) {
        fetchStr += `  body: JSON.stringify(${body})\n`;
      }
      
      fetchStr += `})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error("Error:", error));`;

      setOutput(fetchStr);
    } catch (err: any) {
      setError(err.message || "Failed to parse cURL command.");
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
          toolSlug: "curl-to-fetch",
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
          body: JSON.stringify({ toolSlug: "curl-to-fetch" }),
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
          onClick={convertCurlToFetch}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <Play className="h-3.5 w-3.5" />
          Convert to Fetch
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Trash
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Fetch"}
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
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">cURL CLI Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Javascript Fetch Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Fetch snippet will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
