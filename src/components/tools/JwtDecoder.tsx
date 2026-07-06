"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Info, Save, Trash2 } from "lucide-react";

export default function JwtDecoder() {
  const { data: session } = useSession();
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const decodeToken = (jwt: string) => {
    if (!jwt.trim()) {
      setHeader("");
      setPayload("");
      setSignature("");
      setError(null);
      return;
    }

    const parts = jwt.split(".");
    if (parts.length !== 3) {
      setError("A JWT must consist of exactly 3 parts separated by dots (.)");
      setHeader("");
      setPayload("");
      setSignature("");
      return;
    }

    const base64UrlDecode = (str: string) => {
      try {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        // Pad base64 string
        while (base64.length % 4) {
          base64 += "=";
        }
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      } catch (err) {
        throw new Error("Invalid base64url sequence.");
      }
    };

    try {
      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
      setSignature(parts[2]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to decode JWT segments.");
      setHeader("");
      setPayload("");
      setSignature("");
    }
  };

  useEffect(() => {
    decodeToken(token);
  }, [token]);

  const handleClear = () => {
    setToken("");
    setSaveStatus("idle");
  };

  const handleCopyPayload = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
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
    if (!token || error) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "jwt-decoder",
          inputRef: JSON.stringify({ tokenExcerpt: token.substring(0, 50) + "..." }),
          outputRef: JSON.stringify({ header, payload }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "jwt-decoder" }),
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
            Paste your token in the input field below
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
            onClick={handleCopyPayload}
            disabled={!payload}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Payload"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!token || !!error || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono flex items-center gap-2">
          <span>Error: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Token Input */}
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">JWT Token Input</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ..."
            className="h-[430px] w-full p-4 rounded-xl mono-input text-xs resize-none break-all"
            spellCheck="false"
          />
        </div>

        {/* Parsed Output */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-mono text-neon-violet uppercase tracking-wider">Header (Algorithm & Token Type)</span>
            <pre className="p-3.5 rounded-xl border border-white/5 bg-black/60 font-mono text-[11px] text-neon-violet overflow-x-auto min-h-24 max-h-36">
              {header || "No Header Data"}
            </pre>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-wider">Payload (Claims & Data)</span>
            <pre className="p-3.5 rounded-xl border border-white/5 bg-black/60 font-mono text-[11px] text-neon-cyan overflow-x-auto min-h-48 max-h-56">
              {payload || "No Payload Data"}
            </pre>
          </div>

          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Signature Raw Hash</span>
            <pre className="p-3.5 rounded-xl border border-white/5 bg-black/60 font-mono text-[11px] text-slate-400 overflow-x-auto truncate">
              {signature || "No Signature Data"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
