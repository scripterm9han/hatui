"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save } from "lucide-react";

export default function PlaceholderImage() {
  const { data: session } = useSession();
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [bg, setBg] = useState("#1e293b");
  const [fg, setFg] = useState("#94a3b8");
  const [label, setLabel] = useState("");
  const [svgUrl, setSvgUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const displayLabel = label || `${width} x ${height}`;
  
  const generateSvgContent = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace, sans-serif" font-size="14" fill="${fg}">${displayLabel}</text>
</svg>`;
  };

  useEffect(() => {
    const rawSvg = generateSvgContent();
    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
    setSvgUrl(encoded);
  }, [width, height, bg, fg, label]);

  const handleCopy = async () => {
    if (!svgUrl) return;
    try {
      await navigator.clipboard.writeText(svgUrl);
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
          toolSlug: "placeholder-image",
          inputRef: JSON.stringify({ width, height, bg }),
          outputRef: JSON.stringify({ svgUrlExcerpt: svgUrl.substring(0, 80) + "..." }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "placeholder-image" }),
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
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Dimensions & Colors</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Width (px)</label>
              <input
                type="number"
                min="10"
                max="2000"
                value={width}
                onChange={(e) => setWidth(Math.max(10, parseInt(e.target.value) || 10))}
                className="h-9 px-3 rounded-lg mono-input text-xs"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Height (px)</label>
              <input
                type="number"
                min="10"
                max="2000"
                value={height}
                onChange={(e) => setHeight(Math.max(10, parseInt(e.target.value) || 10))}
                className="h-9 px-3 rounded-lg mono-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block uppercase">Background</label>
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
                  className="w-20 h-9 rounded bg-black border border-slate-800 text-[10px] font-mono text-center text-white"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 block uppercase">Text Color</label>
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
                  className="w-20 h-9 rounded bg-black border border-slate-800 text-[10px] font-mono text-center text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1 pt-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Custom Label Text (Optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Hero Image Banner"
              className="h-9 px-3 rounded-lg mono-input text-xs"
            />
          </div>
        </div>

        {/* Visual Swatch Image */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Rendered Swatch</span>
          {svgUrl && (
            <img
              src={svgUrl}
              alt="Placeholder preview"
              className="max-w-full max-h-40 rounded-xl border border-white/10 shadow-lg object-contain bg-slate-900"
            />
          )}
          <span className="text-[10px] font-mono text-slate-500">
            Format: SVG Data URL
          </span>
        </div>
      </div>

      {/* Output block */}
      <div className="glass-card rounded-xl border border-border-card p-5 space-y-3 bg-bg-darker/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Image Source Path (Data URL)</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Data URL"}
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
          value={svgUrl}
          readOnly
          className="w-full h-16 p-3 rounded-lg mono-input text-[10px] text-neon-cyan font-mono resize-none bg-black/50 border-white/5 select-all"
        />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
