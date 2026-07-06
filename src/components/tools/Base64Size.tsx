"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Info, Save, Trash2 } from "lucide-react";

export default function Base64Size() {
  const { data: session } = useSession();
  const [base64, setBase64] = useState("SGVsbG8gZnJvbSBIYXRpeWFyIEVuZ2luZWVyaW5nIFN1aXRlISA8c2NyaXB0Pg==");
  const [originalBytes, setOriginalBytes] = useState(0);
  const [base64Bytes, setBase64Bytes] = useState(0);
  const [overhead, setOverhead] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const calculateSize = () => {
    if (!base64.trim()) {
      setOriginalBytes(0);
      setBase64Bytes(0);
      setOverhead(0);
      return;
    }

    const cleaned = base64.replace(/\s/g, "");
    const base64Len = cleaned.length;
    setBase64Bytes(base64Len);

    // Padding character count
    const padding = (cleaned.match(/=/g) || []).length;
    const originalLen = Math.round((base64Len * 3) / 4) - padding;
    setOriginalBytes(originalLen);

    // Overhead calculation
    if (originalLen > 0) {
      const diff = ((base64Len - originalLen) / originalLen) * 100;
      setOverhead(diff);
    } else {
      setOverhead(0);
    }
  };

  useEffect(() => {
    calculateSize();
  }, [base64]);

  const handleClear = () => {
    setBase64("");
    setSaveStatus("idle");
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
          toolSlug: "base64-size",
          inputRef: JSON.stringify({ length: base64.length }),
          outputRef: JSON.stringify({ originalBytes, overhead: overhead.toFixed(1) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "base64-size" }),
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
          Base64 Size & Overhead Analyzer
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
            onClick={handleSaveOutput}
            disabled={!base64.trim() || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Base64 Code Input</label>
          <textarea
            value={base64}
            onChange={(e) => setBase64(e.target.value)}
            className="h-60 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-4 justify-between">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Original Binary</span>
              <span className="text-sm font-bold text-neon-cyan font-mono">{originalBytes} B</span>
            </div>

            <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Base64 Length</span>
              <span className="text-sm font-bold text-neon-violet font-mono">{base64Bytes} B</span>
            </div>

            <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Overhead Size</span>
              <span className="text-sm font-bold text-white font-mono">+{overhead.toFixed(0)}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-bg-darker/10 flex items-center gap-3 text-xs text-slate-400 font-mono leading-relaxed">
            <Info className="h-5 w-5 text-neon-cyan shrink-0" />
            <span>
              Base64 encoding incurs a standard **33% overhead increase** in byte size because it maps 3-byte binary segments into 4-character ASCII chunks.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
