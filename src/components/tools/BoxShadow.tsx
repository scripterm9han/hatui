"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save } from "lucide-react";

export default function BoxShadow() {
  const { data: session } = useSession();
  const [hOffset, setHOffset] = useState(0);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(25);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(40);
  const [inset, setInset] = useState(false);
  const [shadowRule, setShadowRule] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const hexToRgba = (hex: string, op: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${(op / 100).toFixed(2)})`;
  };

  useEffect(() => {
    const rgba = hexToRgba(color, opacity);
    const rule = `${inset ? "inset " : ""}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${rgba}`;
    setShadowRule(`box-shadow: ${rule};`);
  }, [hOffset, vOffset, blur, spread, color, opacity, inset]);

  const handleCopy = async () => {
    if (!shadowRule) return;
    try {
      await navigator.clipboard.writeText(shadowRule);
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
          toolSlug: "box-shadow",
          inputRef: JSON.stringify({ hOffset, vOffset, blur }),
          outputRef: JSON.stringify({ shadowRule }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "box-shadow" }),
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
        {/* Sliders and Selectors */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4 bg-bg-darker/20">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Parameters</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-400">
              <input
                type="checkbox"
                checked={inset}
                onChange={(e) => setInset(e.target.checked)}
                className="rounded border-slate-800 bg-black text-neon-cyan focus:ring-0"
              />
              Inset Shadow
            </label>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Horizontal Offset</span>
                <span>{hOffset}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={hOffset}
                onChange={(e) => setHOffset(parseInt(e.target.value))}
                className="w-full accent-neon-cyan"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Vertical Offset</span>
                <span>{vOffset}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={vOffset}
                onChange={(e) => setVOffset(parseInt(e.target.value))}
                className="w-full accent-neon-cyan"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Blur Radius</span>
                <span>{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={blur}
                onChange={(e) => setBlur(parseInt(e.target.value))}
                className="w-full accent-neon-cyan"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Spread Radius</span>
                <span>{spread}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={spread}
                onChange={(e) => setSpread(parseInt(e.target.value))}
                className="w-full accent-neon-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block uppercase">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-9 rounded bg-black border border-slate-800 text-[10px] text-center text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Opacity</span>
                  <span>{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Shadow Preview Box */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Live Box Preview</span>
          
          <div className="w-44 h-44 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative">
            {/* The element casting shadow */}
            <div
              className="w-24 h-24 rounded-xl bg-neon-cyan/15 border border-neon-cyan/25 flex items-center justify-center text-[10px] text-neon-cyan font-mono"
              style={{
                boxShadow: inset
                  ? `inset ${hOffset}px ${vOffset}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`
                  : `${hOffset}px ${vOffset}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`,
              }}
            >
              Shadow Node
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border-card p-5 space-y-3 bg-bg-darker/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CSS Style Output</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy CSS Code"}
            </button>
            <button
              onClick={handleSaveOutput}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
            >
              Save Output
            </button>
          </div>
        </div>
        <textarea
          value={shadowRule}
          readOnly
          className="w-full h-16 p-3 rounded-lg mono-input text-xs text-neon-cyan font-mono resize-none bg-black/50 border-white/5 select-all"
        />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
