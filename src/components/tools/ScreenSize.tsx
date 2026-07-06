"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Info, Monitor, RefreshCw, Save } from "lucide-react";

export default function ScreenSize() {
  const { data: session } = useSession();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [pixelRatio, setPixelRatio] = useState(1);
  const [colorDepth, setColorDepth] = useState(24);
  const [orientation, setOrientation] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const updateMetrics = () => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      setScreenWidth(window.screen.width);
      setScreenHeight(window.screen.height);
      setPixelRatio(window.devicePixelRatio || 1);
      setColorDepth(window.screen.colorDepth || 24);
      setOrientation(window.screen.orientation?.type || "unknown");
    }
  };

  useEffect(() => {
    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    return () => window.removeEventListener("resize", updateMetrics);
  }, []);

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
          toolSlug: "screen-size",
          inputRef: JSON.stringify({ device: "client-screen" }),
          outputRef: JSON.stringify({ viewport: `${viewportWidth}x${viewportHeight}`, pixelRatio }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "screen-size" }),
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Monitor className="h-4 w-4 text-neon-cyan" />
            Viewport Inspector
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={updateMetrics}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Viewport size</span>
          <span className="text-sm font-bold text-neon-cyan font-mono">{viewportWidth} x {viewportHeight}</span>
        </div>

        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Screen size</span>
          <span className="text-sm font-bold text-neon-violet font-mono">{screenWidth} x {screenHeight}</span>
        </div>

        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Device Pixel Ratio</span>
          <span className="text-sm font-bold text-white font-mono">{pixelRatio}dppx</span>
        </div>

        <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Orientation type</span>
          <span className="text-sm font-bold text-slate-400 font-mono truncate block">{orientation}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/5 bg-bg-darker/10 flex items-center gap-3 text-xs text-slate-400 font-mono leading-relaxed">
        <Info className="h-5 w-5 text-neon-cyan shrink-0" />
        <span>
          Resize your browser window or switch orientation on mobile devices to watch metrics update dynamically.
        </span>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
