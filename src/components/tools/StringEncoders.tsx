"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2, RefreshCw } from "lucide-react";

type EncoderType = "binary" | "octal" | "decimal" | "unicode" | "leet" | "rot13" | "caesar" | "vigenere";

export default function StringEncoders({ defaultTool = "binary" }: { defaultTool?: EncoderType }) {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<EncoderType>(defaultTool);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hatiyar Suite 2026");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState("key");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const runEncode = () => {
    setError(null);
    try {
      if (mode === "encode") {
        let res = "";
        switch (activeTool) {
          case "binary":
            res = input.split("").map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
            break;
          case "octal":
            res = input.split("").map((c) => c.charCodeAt(0).toString(8).padStart(3, "0")).join(" ");
            break;
          case "decimal":
            res = input.split("").map((c) => c.charCodeAt(0).toString(10)).join(" ");
            break;
          case "unicode":
            res = input.split("").map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("");
            break;
          case "leet":
            const leetMap: Record<string, string> = { a: "4", e: "3", g: "6", i: "1", o: "0", s: "5", t: "7" };
            res = input.toLowerCase().split("").map((c) => leetMap[c] || c).join("");
            break;
          case "rot13":
            res = input.replace(/[a-zA-Z]/g, (c) => {
              const code = c.charCodeAt(0);
              const base = code >= 97 ? 97 : 65;
              return String.fromCharCode(((code - base + 13) % 26) + base);
            });
            break;
          case "caesar":
            res = input.replace(/[a-zA-Z]/g, (c) => {
              const code = c.charCodeAt(0);
              const base = code >= 97 ? 97 : 65;
              return String.fromCharCode(((code - base + caesarShift + 26) % 26) + base);
            });
            break;
          case "vigenere":
            const k = vigenereKey.toLowerCase();
            let kIdx = 0;
            res = input.replace(/[a-zA-Z]/g, (c) => {
              const code = c.charCodeAt(0);
              const isUpper = code < 97;
              const base = isUpper ? 65 : 97;
              const shift = k.charCodeAt(kIdx % k.length) - 97;
              kIdx++;
              return String.fromCharCode(((code - base + shift) % 26) + base);
            });
            break;
        }
        setOutput(res);
      } else {
        // Decoding Logic
        let res = "";
        switch (activeTool) {
          case "binary":
            res = input.trim().split(/\s+/).map((b) => String.fromCharCode(parseInt(b, 2))).join("");
            break;
          case "octal":
            res = input.trim().split(/\s+/).map((o) => String.fromCharCode(parseInt(o, 8))).join("");
            break;
          case "decimal":
            res = input.trim().split(/\s+/).map((d) => String.fromCharCode(parseInt(d, 10))).join("");
            break;
          case "unicode":
            res = input.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
            break;
          case "leet":
            // Leet decoding is heuristic only
            const reverseLeet: Record<string, string> = { "4": "a", "3": "e", "6": "g", "1": "i", "0": "o", "5": "s", "7": "t" };
            res = input.split("").map((c) => reverseLeet[c] || c).join("");
            break;
          case "rot13":
            // Rot13 is its own inverse
            res = input.replace(/[a-zA-Z]/g, (c) => {
              const code = c.charCodeAt(0);
              const base = code >= 97 ? 97 : 65;
              return String.fromCharCode(((code - base + 13) % 26) + base);
            });
            break;
          case "caesar":
            res = input.replace(/[a-zA-Z]/g, (c) => {
              const code = c.charCodeAt(0);
              const base = code >= 97 ? 97 : 65;
              return String.fromCharCode(((code - base - caesarShift + 26) % 26) + base);
            });
            break;
          case "vigenere":
            const key = vigenereKey.toLowerCase();
            let kIdx = 0;
            res = input.replace(/[a-zA-Z]/g, (c) => {
              const code = c.charCodeAt(0);
              const isUpper = code < 97;
              const base = isUpper ? 65 : 97;
              const shift = key.charCodeAt(kIdx % key.length) - 97;
              kIdx++;
              return String.fromCharCode(((code - base - shift + 26) % 26) + base);
            });
            break;
        }
        setOutput(res);
      }
    } catch (err: any) {
      setError("Parsing error. Verify output alignment for selected encoding.");
      setOutput("");
    }
  };

  useEffect(() => {
    runEncode();
  }, [input, activeTool, mode, caesarShift, vigenereKey]);

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    const text = output || input;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs.");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: `${activeTool}-converter`,
          inputRef: JSON.stringify({ mode }),
          outputRef: JSON.stringify({ excerpt: output.substring(0, 100) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: `${activeTool}-converter` }),
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
      {/* Header Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "binary", label: "Binary" },
          { id: "octal", label: "Octal" },
          { id: "decimal", label: "Decimal" },
          { id: "unicode", label: "Unicode" },
          { id: "leet", label: "Leet Speak" },
          { id: "rot13", label: "Rot13" },
          { id: "caesar", label: "Caesar" },
          { id: "vigenere", label: "Vigenère" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as EncoderType);
              setSaveStatus("idle");
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              activeTool === t.id
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("encode")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "encode"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "decode"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Decode
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

        {/* Tweakable options per tool */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          {activeTool === "caesar" && (
            <div className="flex items-center gap-1.5">
              <span>Shift:</span>
              <input
                type="number"
                value={caesarShift}
                onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
                className="w-16 h-8 px-2 rounded bg-black border border-slate-800 text-center"
              />
            </div>
          )}
          {activeTool === "vigenere" && (
            <div className="flex items-center gap-1.5">
              <span>Keyword:</span>
              <input
                type="text"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                className="w-24 h-8 px-2 rounded bg-black border border-slate-800 text-center"
              />
            </div>
          )}
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

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Input Text</label>
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
            placeholder="Result will appear here..."
            className="h-60 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
