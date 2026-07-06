"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Trash2, Info } from "lucide-react";

export default function UrlParser() {
  const { data: session } = useSession();
  const [urlInput, setUrlInput] = useState("https://hatiyar.in:3000/tools/url-parser?theme=dark&pro=true#docs");
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const parseUrl = (val: string) => {
    if (!val.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    setError(null);
    try {
      // Ensure protocol exists for URL parsing
      let target = val.trim();
      if (!/^https?:\/\//i.test(target)) {
        target = "https://" + target;
      }
      
      const u = new URL(target);
      const queryParams: { key: string; val: string }[] = [];
      u.searchParams.forEach((value, key) => {
        queryParams.push({ key, val: value });
      });

      setParsed({
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port || "default",
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        queryParams,
      });
    } catch {
      setError("Malformed URL string. Cannot resolve hostname or path.");
      setParsed(null);
    }
  };

  useEffect(() => {
    parseUrl(urlInput);
  }, [urlInput]);

  const handleClear = () => {
    setUrlInput("");
    setParsed(null);
    setError(null);
    setSaveStatus("idle");
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs to your dashboard.");
      return;
    }
    if (!parsed) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "url-parser",
          inputRef: JSON.stringify({ url: urlInput }),
          outputRef: JSON.stringify({ host: parsed.host, path: parsed.pathname }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "url-parser" }),
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
            URL Breakdown
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
            disabled={!parsed || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">URL String Input</label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste URL (e.g. https://google.com/search?q=hatiyar)..."
            className="w-full h-11 px-4 rounded-lg mono-input text-xs"
          />
        </div>

        {error && (
          <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-450 text-xs font-mono">
            {error}
          </div>
        )}

        {parsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Split table */}
            <div className="glass-card rounded-xl border border-border-card p-5 bg-bg-darker/20 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Components</span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500">Protocol:</span>
                  <span className="text-white font-bold">{parsed.protocol}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500">Hostname:</span>
                  <span className="text-white font-bold">{parsed.hostname}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500">Port:</span>
                  <span className="text-white font-bold">{parsed.port}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500">Pathname:</span>
                  <span className="text-neon-cyan font-bold">{parsed.pathname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hash fragment:</span>
                  <span className="text-neon-violet font-bold">{parsed.hash || "none"}</span>
                </div>
              </div>
            </div>

            {/* Query parameters list */}
            <div className="glass-card rounded-xl border border-border-card p-5 bg-bg-darker/20 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Query Parameters ({parsed.queryParams.length})</span>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {parsed.queryParams.length > 0 ? (
                  parsed.queryParams.map((param: any, idx: number) => (
                    <div key={idx} className="flex justify-between bg-black/40 p-2 rounded border border-white/5 text-[10px] font-mono">
                      <span className="text-neon-cyan font-bold truncate max-w-[100px]">{param.key}</span>
                      <span className="text-slate-400 truncate max-w-[120px]">{param.val}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-[10px] font-mono py-8 text-center">
                    No query parameters parsed in the URL.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
