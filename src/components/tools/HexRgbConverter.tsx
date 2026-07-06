"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2 } from "lucide-react";

export default function HexRgbConverter() {
  const { data: session } = useSession();
  const [hex, setHex] = useState("#00f0ff");
  const [r, setR] = useState(0);
  const [g, setG] = useState(240);
  const [b, setB] = useState(255);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const hexToRgb = (hexStr: string) => {
    const cleanHex = hexStr.replace("#", "").trim();
    if (cleanHex.length !== 3 && cleanHex.length !== 6) return null;
    
    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
      fullHex = cleanHex.split("").map((c) => c + c).join("");
    }
    
    const num = parseInt(fullHex, 16);
    if (isNaN(num)) return null;

    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgbToHex = (red: number, green: number, blue: number) => {
    const clamp = (val: number) => Math.min(Math.max(0, val), 255);
    const cr = clamp(red);
    const cg = clamp(green);
    const cb = clamp(blue);

    return (
      "#" +
      ((1 << 24) + (cr << 16) + (cg << 8) + cb)
        .toString(16)
        .slice(1)
        .toUpperCase()
    );
  };

  const handleHexChange = (val: string) => {
    setHex(val);
    const rgb = hexToRgb(val);
    if (rgb) {
      setR(rgb.r);
      setG(rgb.g);
      setB(rgb.b);
    }
  };

  const handleRgbChange = (nr: number, ng: number, nb: number) => {
    setR(nr);
    setG(ng);
    setB(nb);
    setHex(rgbToHex(nr, ng, nb));
  };

  const handleCopy = async () => {
    const text = `Hex: ${hex} | RGB: rgb(${r}, ${g}, ${b})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    setHex("#000000");
    setR(0);
    setG(0);
    setB(0);
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
          toolSlug: "hex-rgb-converter",
          inputRef: JSON.stringify({ hex }),
          outputRef: JSON.stringify({ rgb: `rgb(${r}, ${g}, ${b})` }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "hex-rgb-converter" }),
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
      <div className="flex justify-between border-b border-white/5 pb-4">
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          Color Translator Swatch
        </h4>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="px-3 h-8 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Clear
          </button>
          <button
            onClick={handleCopy}
            className="px-3 h-8 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono"
          >
            {copied ? "Copied" : "Copy values"}
          </button>
          <button
            onClick={handleSaveOutput}
            className="px-3 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Input sliders */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Hex Color Code</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              className="w-full h-10 px-4 rounded-lg mono-input text-xs text-white"
            />
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">RGB Values</span>
            
            {/* Red slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Red:</span>
                <span className="text-red-400 font-bold">{r}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={r}
                onChange={(e) => handleRgbChange(parseInt(e.target.value) || 0, g, b)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Green slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Green:</span>
                <span className="text-green-400 font-bold">{g}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={g}
                onChange={(e) => handleRgbChange(r, parseInt(e.target.value) || 0, b)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Blue slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Blue:</span>
                <span className="text-blue-400 font-bold">{b}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={b}
                onChange={(e) => handleRgbChange(r, g, parseInt(e.target.value) || 0)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Color preview box */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Visual Preview</span>
          <div
            className="w-full h-44 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300"
            style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
          />
          <span className="text-xs font-mono text-slate-400">
            rgb({r}, {g}, {b})
          </span>
        </div>
      </div>
    </div>
  );
}
