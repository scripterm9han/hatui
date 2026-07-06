"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Trash2, Info } from "lucide-react";

export default function UserAgent() {
  const { data: session } = useSession();
  const [uaInput, setUaInput] = useState("");
  const [browser, setBrowser] = useState("");
  const [os, setOs] = useState("");
  const [engine, setEngine] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const parseUserAgent = (ua: string) => {
    if (!ua.trim()) {
      setBrowser("Unknown");
      setOs("Unknown");
      setEngine("Unknown");
      return;
    }

    // 1. OS Classification
    let parsedOs = "Unknown OS";
    if (/windows/i.test(ua)) parsedOs = "Windows OS";
    else if (/macintosh|mac os x/i.test(ua)) parsedOs = "macOS";
    else if (/android/i.test(ua)) parsedOs = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) parsedOs = "iOS";
    else if (/linux/i.test(ua)) parsedOs = "Linux";

    // 2. Browser Classification
    let parsedBrowser = "Unknown Browser";
    if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr|opera/i.test(ua)) {
      parsedBrowser = "Google Chrome";
    } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
      parsedBrowser = "Apple Safari";
    } else if (/firefox|iceweasel/i.test(ua)) {
      parsedBrowser = "Mozilla Firefox";
    } else if (/edge|edg/i.test(ua)) {
      parsedBrowser = "Microsoft Edge";
    } else if (/opr|opera/i.test(ua)) {
      parsedBrowser = "Opera";
    }

    // 3. Engine Classification
    let parsedEngine = "Unknown Engine";
    if (/webkit/i.test(ua)) parsedEngine = "Apple WebKit";
    else if (/gecko/i.test(ua) && !/webkit/i.test(ua)) parsedEngine = "Gecko (Firefox)";
    else if (/trident/i.test(ua)) parsedEngine = "Trident (IE)";

    setBrowser(parsedBrowser);
    setOs(parsedOs);
    setEngine(parsedEngine);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator) {
      setUaInput(window.navigator.userAgent);
    }
  }, []);

  useEffect(() => {
    parseUserAgent(uaInput);
  }, [uaInput]);

  const handleClear = () => {
    setUaInput("");
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
          toolSlug: "user-agent",
          inputRef: JSON.stringify({ uaExcerpt: uaInput.substring(0, 80) }),
          outputRef: JSON.stringify({ browser, os }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "user-agent" }),
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
            <Info className="h-4 w-4 text-neon-cyan" />
            User Agent Parser
          </span>
        </div>

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
            disabled={!uaInput || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Raw User Agent String</label>
          <textarea
            value={uaInput}
            onChange={(e) => setUaInput(e.target.value)}
            placeholder="Paste User Agent string (e.g. Mozilla/5.0 (Windows NT 10.0; Win64; x64)...)"
            className="w-full h-24 p-4 rounded-xl mono-input text-xs resize-none"
          />
        </div>

        {uaInput && (
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Browser</span>
              <span className="text-sm font-bold text-neon-cyan font-mono">{browser}</span>
            </div>

            <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Operating System</span>
              <span className="text-sm font-bold text-neon-violet font-mono">{os}</span>
            </div>

            <div className="glass-card rounded-lg border border-slate-850 p-4 text-center space-y-1 bg-bg-darker/20">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Rendering Engine</span>
              <span className="text-sm font-bold text-white font-mono">{engine}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
