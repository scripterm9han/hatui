"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save } from "lucide-react";

export default function ContrastChecker() {
  const { data: session } = useSession();
  const [bg, setBg] = useState("#0f172a");
  const [fg, setFg] = useState("#00f0ff");
  const [contrastRatio, setContrastRatio] = useState(1);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const getLuminance = (hex: string) => {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    const xs = [r / 255, g / 255, b / 255].map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * xs[0] + 0.7152 * xs[1] + 0.0722 * xs[2];
  };

  useEffect(() => {
    const l1 = getLuminance(bg);
    const l2 = getLuminance(fg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    setContrastRatio(ratio);
  }, [bg, fg]);

  const aaNormal = contrastRatio >= 4.5;
  const aaLarge = contrastRatio >= 3.0;
  const aaaNormal = contrastRatio >= 7.0;
  const aaaLarge = contrastRatio >= 4.5;

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
          toolSlug: "contrast-checker",
          inputRef: JSON.stringify({ bg, fg }),
          outputRef: JSON.stringify({ contrastRatio: contrastRatio.toFixed(2) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "contrast-checker" }),
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
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">
        {/* Controls */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4 bg-bg-darker/20">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Contrast Parameters</span>
          
          <div className="grid grid-cols-2 gap-4 font-mono text-xs text-slate-400">
            <div className="space-y-2">
              <label className="uppercase text-[10px] text-slate-500">Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-20 h-9 rounded bg-black border border-slate-800 text-[10px] text-center text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="uppercase text-[10px] text-slate-500">Foreground Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="w-20 h-9 rounded bg-black border border-slate-800 text-[10px] text-center text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-mono text-slate-500">Save pairing configuration</span>
            <button
              onClick={handleSaveOutput}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
            >
              Save Pairing
            </button>
          </div>
        </div>

        {/* Visual Pairing Sandbox Preview */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Visual pairing preview</span>
          
          <div
            className="w-44 h-44 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4 text-center justify-around shadow-lg transition-all"
            style={{ backgroundColor: bg, color: fg }}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold font-sans">Sample normal text</span>
              <span className="text-[10px] block opacity-80 font-mono">12pt Normal Text</span>
            </div>
            <div className="space-y-1">
              <span className="text-base font-extrabold font-sans">Large Head</span>
              <span className="text-[9px] block opacity-80 font-mono">18pt Bold Text</span>
            </div>
          </div>
        </div>
      </div>

      {/* WCAG Compliance Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Contrast Ratio</span>
          <span className="text-lg font-bold text-neon-cyan font-mono">{contrastRatio.toFixed(2)} : 1</span>
        </div>

        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">WCAG Normal AA</span>
          <span className={`text-xs font-bold font-mono ${aaNormal ? "text-green-400" : "text-red-400"}`}>
            {aaNormal ? "PASS (>= 4.5)" : "FAIL (< 4.5)"}
          </span>
        </div>

        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">WCAG Large AA</span>
          <span className={`text-xs font-bold font-mono ${aaLarge ? "text-green-400" : "text-red-400"}`}>
            {aaLarge ? "PASS (>= 3.0)" : "FAIL (< 3.0)"}
          </span>
        </div>

        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">WCAG Normal AAA</span>
          <span className={`text-xs font-bold font-mono ${aaaNormal ? "text-green-400" : "text-red-400"}`}>
            {aaaNormal ? "PASS (>= 7.0)" : "FAIL (< 7.0)"}
          </span>
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
