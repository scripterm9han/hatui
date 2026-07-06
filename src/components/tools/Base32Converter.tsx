"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2, RefreshCw } from "lucide-react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export default function Base32Converter() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const encodeBase32 = (str: string) => {
    let bin = "";
    for (let i = 0; i < str.length; i++) {
      bin += str.charCodeAt(i).toString(2).padStart(8, "0");
    }
    
    let res = "";
    for (let i = 0; i < bin.length; i += 5) {
      const chunk = bin.substring(i, i + 5).padEnd(5, "0");
      const val = parseInt(chunk, 2);
      res += ALPHABET[val];
    }
    
    while (res.length % 8 !== 0) {
      res += "=";
    }
    return res;
  };

  const decodeBase32 = (str: string) => {
    const clean = str.replace(/=+$/, "").toUpperCase().trim();
    if (!clean) return "";
    
    let bin = "";
    for (let i = 0; i < clean.length; i++) {
      const idx = ALPHABET.indexOf(clean[i]);
      if (idx === -1) {
        throw new Error(`Invalid Base32 character: ${clean[i]}`);
      }
      bin += idx.toString(2).padStart(5, "0");
    }
    
    let res = "";
    for (let i = 0; i < bin.length; i += 8) {
      const chunk = bin.substring(i, i + 8);
      if (chunk.length < 8) break;
      const val = parseInt(chunk, 2);
      res += String.fromCharCode(val);
    }
    return res;
  };

  const handleConvert = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(encodeBase32(input));
      } else {
        setOutput(decodeBase32(input));
      }
    } catch (err: any) {
      setError(err.message || "Failed to decode Base32.");
      setOutput("");
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
    setError(null);
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
    if (!input.trim()) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "base32-converter",
          inputRef: JSON.stringify({ mode, length: input.length }),
          outputRef: JSON.stringify({ length: (output || input).length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "base32-converter" }),
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
        <div className="flex gap-2">
          <button
            onClick={() => setMode("encode")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "encode"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Encode Mode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "decode"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Decode Mode
          </button>
          <button
            onClick={handleSwap}
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-neon-cyan text-xs font-mono transition-all disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            Swap
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleConvert}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
          >
            Execute
          </button>
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
            {copied ? "Copied" : "Copy"}
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
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">
            {mode === "encode" ? "Raw Input Text" : "Base32 Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter raw text to encode..." : "Enter Base32 sequence..."}
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">
            {mode === "encode" ? "Base32 Output" : "Decoded Output"}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
