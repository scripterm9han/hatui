"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2 } from "lucide-react";

type BaseType = "10" | "2" | "8" | "16";

export default function BaseConverter() {
  const { data: session } = useSession();
  const [inputVal, setInputVal] = useState("42");
  const [fromBase, setFromBase] = useState<BaseType>("10");
  const [toBase, setToBase] = useState<BaseType>("2");
  const [outputVal, setOutputVal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const convertBases = () => {
    if (!inputVal.trim()) {
      setOutputVal("");
      setError(null);
      return;
    }
    setError(null);
    try {
      const parsed = parseInt(inputVal.trim(), Number(fromBase));
      if (isNaN(parsed)) {
        throw new Error(`Invalid digit sequence for base ${fromBase}`);
      }
      setOutputVal(parsed.toString(Number(toBase)).toUpperCase());
    } catch (err: any) {
      setError(err.message || "Failed to convert bases.");
      setOutputVal("");
    }
  };

  useEffect(() => {
    convertBases();
  }, [inputVal, fromBase, toBase]);

  const handleClear = () => {
    setInputVal("");
    setOutputVal("");
    setError(null);
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    if (!outputVal) return;
    try {
      await navigator.clipboard.writeText(outputVal);
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
    if (!outputVal) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "base-converter",
          inputRef: JSON.stringify({ fromBase, toBase, inputVal }),
          outputRef: JSON.stringify({ result: outputVal }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "base-converter" }),
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">From:</label>
            <select
              value={fromBase}
              onChange={(e) => setFromBase(e.target.value as BaseType)}
              className="h-9 px-2 rounded-lg mono-input text-xs bg-black"
            >
              <option value="10">Decimal (Base 10)</option>
              <option value="2">Binary (Base 2)</option>
              <option value="8">Octal (Base 8)</option>
              <option value="16">Hexadecimal (Base 16)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">To:</label>
            <select
              value={toBase}
              onChange={(e) => setToBase(e.target.value as BaseType)}
              className="h-9 px-2 rounded-lg mono-input text-xs bg-black"
            >
              <option value="2">Binary (Base 2)</option>
              <option value="10">Decimal (Base 10)</option>
              <option value="8">Octal (Base 8)</option>
              <option value="16">Hexadecimal (Base 16)</option>
            </select>
          </div>
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
            disabled={!outputVal}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Result"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!outputVal || saveStatus === "saving"}
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
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Number Input</label>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter digits to translate..."
            className="w-full h-11 px-4 rounded-xl mono-input text-xs"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Converted Result</label>
          <input
            type="text"
            value={outputVal}
            readOnly
            placeholder="Result will appear here..."
            className="w-full h-11 px-4 rounded-xl mono-input text-xs bg-black/60 border-white/5 text-neon-cyan font-bold font-mono"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
