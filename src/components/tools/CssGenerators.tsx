"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Sparkles } from "lucide-react";

type CssToolType = "border-radius" | "glassmorphism" | "text-shadow" | "clip-path" | "filters" | "transition" | "transform";

export default function CssGenerators({ defaultTool = "border-radius" }: { defaultTool?: CssToolType }) {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<CssToolType>(defaultTool);
  const [cssCode, setCssCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // State for Border Radius
  const [brTopLeft, setBrTopLeft] = useState(15);
  const [brTopRight, setBrTopRight] = useState(15);
  const [brBottomRight, setBrBottomRight] = useState(15);
  const [brBottomLeft, setBrBottomLeft] = useState(15);

  // State for Glassmorphism
  const [glassBlur, setGlassBlur] = useState(10);
  const [glassOpacity, setGlassOpacity] = useState(15);

  // State for Text Shadow
  const [tsH, setTsH] = useState(2);
  const [tsV, setTsV] = useState(2);
  const [tsBlur, setTsBlur] = useState(4);
  const [tsColor, setTsColor] = useState("#00f0ff");

  // State for Clip Path
  const [clipShape, setClipShape] = useState<"triangle" | "rhombus" | "star">("triangle");

  // State for Filters
  const [filterBlur, setFilterBlur] = useState(0);
  const [filterGrayscale, setFilterGrayscale] = useState(0);
  const [filterHue, setFilterHue] = useState(0);

  // State for Transition
  const [transDur, setTransDur] = useState(0.3);
  const [transType, setTransType] = useState("ease-in-out");

  // State for Transform
  const [transScale, setTransScale] = useState(1);
  const [transRotate, setTransRotate] = useState(0);

  useEffect(() => {
    let code = "";
    switch (activeTool) {
      case "border-radius":
        code = `border-radius: ${brTopLeft}px ${brTopRight}px ${brBottomRight}px ${brBottomLeft}px;`;
        break;
      case "glassmorphism":
        code = `background: rgba(255, 255, 255, ${(glassOpacity / 100).toFixed(2)});\nbackdrop-filter: blur(${glassBlur}px);\nborder: 1px border-white/10;`;
        break;
      case "text-shadow":
        code = `text-shadow: ${tsH}px ${tsV}px ${tsBlur}px ${tsColor};`;
        break;
      case "clip-path":
        const shapePath = clipShape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : clipShape === "rhombus" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
        code = `clip-path: ${shapePath};`;
        break;
      case "filters":
        code = `filter: blur(${filterBlur}px) grayscale(${filterGrayscale}%) hue-rotate(${filterHue}deg);`;
        break;
      case "transition":
        code = `transition: all ${transDur}s ${transType};`;
        break;
      case "transform":
        code = `transform: scale(${transScale}) rotate(${transRotate}deg);`;
        break;
    }
    setCssCode(code);
  }, [activeTool, brTopLeft, brTopRight, brBottomRight, brBottomLeft, glassBlur, glassOpacity, tsH, tsV, tsBlur, tsColor, clipShape, filterBlur, filterGrayscale, filterHue, transDur, transType, transScale, transRotate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
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
          toolSlug: `css-${activeTool}`,
          inputRef: JSON.stringify({ tool: activeTool }),
          outputRef: JSON.stringify({ cssCode }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: `css-${activeTool}` }),
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
      {/* Header Selector tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "border-radius", label: "Border Radius" },
          { id: "glassmorphism", label: "Glassmorphism" },
          { id: "text-shadow", label: "Text Shadow" },
          { id: "clip-path", label: "Clip Path" },
          { id: "filters", label: "Filter Effects" },
          { id: "transition", label: "Transition" },
          { id: "transform", label: "Transform" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as CssToolType);
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

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">
        {/* Controls Layout */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4 bg-bg-darker/20">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Parameters</span>
          
          <div className="space-y-3 text-xs font-mono text-slate-400">
            {activeTool === "border-radius" && (
              <div className="space-y-3">
                {[
                  { label: "Top Left", val: brTopLeft, set: setBrTopLeft },
                  { label: "Top Right", val: brTopRight, set: setBrTopRight },
                  { label: "Bottom Right", val: brBottomRight, set: setBrBottomRight },
                  { label: "Bottom Left", val: brBottomLeft, set: setBrBottomLeft },
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>{s.label}</span>
                      <span>{s.val}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={s.val}
                      onChange={(e) => s.set(parseInt(e.target.value))}
                      className="w-full accent-neon-cyan"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTool === "glassmorphism" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Backdrop Blur</span>
                    <span>{glassBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={glassBlur}
                    onChange={(e) => setGlassBlur(parseInt(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Overlay Opacity</span>
                    <span>{glassOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={glassOpacity}
                    onChange={(e) => setGlassOpacity(parseInt(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
              </div>
            )}

            {activeTool === "text-shadow" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-500 block">H-Offset ({tsH}px)</span>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={tsH}
                      onChange={(e) => setTsH(parseInt(e.target.value))}
                      className="w-full accent-neon-cyan"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block">V-Offset ({tsV}px)</span>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={tsV}
                      onChange={(e) => setTsV(parseInt(e.target.value))}
                      className="w-full accent-neon-cyan"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Blur Radius ({tsBlur}px)</span>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={tsBlur}
                    onChange={(e) => setTsBlur(parseInt(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Shadow Color</span>
                  <input
                    type="color"
                    value={tsColor}
                    onChange={(e) => setTsColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTool === "clip-path" && (
              <div className="space-y-2">
                <label className="text-slate-500 block">Shape Selection</label>
                <select
                  value={clipShape}
                  onChange={(e) => setClipShape(e.target.value as any)}
                  className="h-9 px-2 rounded-lg bg-black border border-slate-800 text-[11px] w-full text-white"
                >
                  <option value="triangle">Triangle</option>
                  <option value="rhombus">Rhombus</option>
                  <option value="star">Star Polygon</option>
                </select>
              </div>
            )}

            {activeTool === "filters" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-slate-500 block">Blur ({filterBlur}px)</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filterBlur}
                    onChange={(e) => setFilterBlur(parseInt(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Grayscale ({filterGrayscale}%)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filterGrayscale}
                    onChange={(e) => setFilterGrayscale(parseInt(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Hue Rotate ({filterHue}deg)</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={filterHue}
                    onChange={(e) => setFilterHue(parseInt(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
              </div>
            )}

            {activeTool === "transition" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-slate-500 block">Duration ({transDur}s)</span>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={transDur}
                    onChange={(e) => setTransDur(parseFloat(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Timing Type</span>
                  <select
                    value={transType}
                    onChange={(e) => setTransType(e.target.value)}
                    className="h-9 px-2 rounded-lg bg-black border border-slate-800 text-[11px] w-full text-white"
                  >
                    <option value="linear">Linear</option>
                    <option value="ease">Ease</option>
                    <option value="ease-in">Ease-In</option>
                    <option value="ease-out">Ease-Out</option>
                    <option value="ease-in-out">Ease-In-Out</option>
                  </select>
                </div>
              </div>
            )}

            {activeTool === "transform" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-slate-500 block">Scale ({transScale}x)</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={transScale}
                    onChange={(e) => setTransScale(parseFloat(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Rotation ({transRotate}deg)</span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={transRotate}
                    onChange={(e) => setTransRotate(parseInt(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual Swatch Preview Box */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Sandbox Preview</span>
          
          <div className="w-44 h-44 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center relative overflow-hidden">
            {activeTool === "border-radius" && (
              <div
                className="w-24 h-24 bg-neon-cyan/20 border border-neon-cyan/30"
                style={{ borderRadius: `${brTopLeft}px ${brTopRight}px ${brBottomRight}px ${brBottomLeft}px` }}
              />
            )}
            {activeTool === "glassmorphism" && (
              <div className="absolute inset-0 bg-gradient-to-tr from-neon-cyan/20 via-transparent to-neon-violet/20 flex items-center justify-center p-4">
                <div
                  className="w-32 h-32 border flex items-center justify-center text-[10px] text-white font-mono rounded-xl"
                  style={{
                    background: `rgba(255, 255, 255, ${glassOpacity / 100})`,
                    backdropFilter: `blur(${glassBlur}px)`,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Glass Card
                </div>
              </div>
            )}
            {activeTool === "text-shadow" && (
              <span
                className="text-base font-extrabold font-sans text-white uppercase tracking-wider"
                style={{ textShadow: `${tsH}px ${tsV}px ${tsBlur}px ${tsColor}` }}
              >
                Hatiyar
              </span>
            )}
            {activeTool === "clip-path" && (
              <div
                className="w-24 h-24 bg-neon-cyan"
                style={{
                  clipPath: clipShape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : clipShape === "rhombus" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                }}
              />
            )}
            {activeTool === "filters" && (
              <div
                className="w-24 h-24 bg-gradient-to-r from-neon-cyan to-neon-violet rounded-xl"
                style={{ filter: `blur(${filterBlur}px) grayscale(${filterGrayscale}%) hue-rotate(${filterHue}deg)` }}
              />
            )}
            {activeTool === "transition" && (
              <div
                className="w-20 h-20 bg-neon-cyan/20 border border-neon-cyan hover:bg-neon-cyan hover:scale-105 rounded-xl cursor-pointer flex items-center justify-center text-[9px] text-neon-cyan hover:text-black font-mono"
                style={{ transition: `all ${transDur}s ${transType}` }}
              >
                Hover Me
              </div>
            )}
            {activeTool === "transform" && (
              <div
                className="w-20 h-20 bg-neon-cyan/20 border border-neon-cyan/30 rounded-xl flex items-center justify-center text-[9px] text-neon-cyan font-mono"
                style={{ transform: `scale(${transScale}) rotate(${transRotate}deg)` }}
              >
                Node
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code output */}
      <div className="glass-card rounded-xl border border-border-card p-5 space-y-3 bg-bg-darker/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CSS Rule Output</span>
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
              disabled={saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
            >
              Save Output
            </button>
          </div>
        </div>
        <textarea
          value={cssCode}
          readOnly
          className="w-full h-16 p-3 rounded-lg mono-input text-xs text-neon-cyan font-mono resize-none bg-black/50 border-white/5 select-all"
        />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
