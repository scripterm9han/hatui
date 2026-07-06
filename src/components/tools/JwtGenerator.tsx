"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function JwtGenerator() {
  const { data: session } = useSession();
  const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [payload, setPayload] = useState('{\n  "sub": "user_123456",\n  "name": "Adwait",\n  "admin": true\n}');
  const [secret, setSecret] = useState("my-super-secret-key-2026");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const base64UrlEncode = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const generateJwt = () => {
    setError(null);
    try {
      // Validate JSON structures
      const parsedHeader = JSON.parse(header);
      const parsedPayload = JSON.parse(payload);

      const headerEnc = base64UrlEncode(JSON.stringify(parsedHeader));
      const payloadEnc = base64UrlEncode(JSON.stringify(parsedPayload));
      
      // Simulate signature (client-safe signature mock representation)
      const mockSignature = base64UrlEncode(`${headerEnc}.${payloadEnc}.${secret}`);
      
      setToken(`${headerEnc}.${payloadEnc}.${mockSignature}`);
    } catch (err: any) {
      setError(err.message || "Invalid header or payload JSON format.");
      setToken("");
    }
  };

  const handleClear = () => {
    setHeader('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
    setPayload('{\n  "sub": "user_123456",\n  "name": "Adwait",\n  "admin": true\n}');
    setSecret("");
    setToken("");
    setError(null);
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
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
          toolSlug: "jwt-generator",
          inputRef: JSON.stringify({ secretLength: secret.length }),
          outputRef: JSON.stringify({ tokenExcerpt: token.substring(0, 50) + "..." }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "jwt-generator" }),
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
        <button
          onClick={generateJwt}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <Play className="h-3.5 w-3.5" />
          Sign JWT Token
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!token}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Token"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!token || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">JWT Header (JSON)</label>
          <textarea
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            className="h-44 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">JWT Payload (JSON)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="h-44 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">HMAC Secret Key</label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full h-11 px-4 rounded-xl mono-input text-xs"
          />
        </div>
      </div>

      {token && (
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-bg-darker/20 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Encoded Token</span>
          <textarea
            value={token}
            readOnly
            className="w-full h-16 p-3 rounded-lg mono-input text-[11px] text-neon-cyan font-mono resize-none bg-black/50 border-white/5 select-all"
          />
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
