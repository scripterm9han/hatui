"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save } from "lucide-react";

export default function CssGradient() {
  const { data: session } = useSession();
  const [color1, setColor1] = useState("#00f0ff");
  const [color2, setColor2] = useState("#ff007f");
  const [angle, setAngle] = useState(90);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const cssString = `background: linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%);`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssString);
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
          toolSlug: "css-gradient",
          inputRef: JSON.stringify({ color1, color2, angle }),
          outputRef: JSON.stringify({ cssString }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "css-gradient" }),
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
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-center">
        
        {/* Editor controls */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-5 bg-bg-darker/20">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Gradient Controls</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block uppercase">Start Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-24 h-9 rounded bg-black border border-slate-800 text-[10px] font-mono text-center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block uppercase">End Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-24 h-9 rounded bg-black border border-slate-800 text-[10px] font-mono text-center"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Angle:</span>
              <span className="text-neon-cyan font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
          </div>
        </div>

        {/* Visual Swatch Preview */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className="w-full h-44 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            style={{ background: `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)` }}
          />
        </div>
      </div>

      {/* Generated CSS String Box */}
      <div className="glass-card rounded-xl border border-border-card p-5 space-y-3 bg-bg-darker/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CSS Code Block</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy CSS"}
            </button>
            <button
              onClick={handleSaveOutput}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
            >
              <Save className="h-3.5 w-3.5" />
              {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
            </button>
          </div>
        </div>
        <textarea
          value={cssString}
          readOnly
          className="w-full h-16 p-3 rounded-lg mono-input text-[11px] text-neon-cyan font-mono resize-none bg-black/50 border-white/5"
        />
      </div>
    </div>
  );
}
