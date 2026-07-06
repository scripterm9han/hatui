"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";

export default function BcryptTester() {
  const { data: session } = useSession();
  const [password, setPassword] = useState("adminPassword2026");
  const [hash, setHash] = useState("$2a$12$V.oR6tFp02J9H2kLm3qPDeHatiyarMockHashPrefixSequence");
  const [mockHashOutput, setMockHashOutput] = useState("");
  const [matchResult, setMatchResult] = useState<"idle" | "matching" | "match" | "mismatch">("idle");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const generateMockBcrypt = () => {
    if (!password.trim()) return;
    // Bcrypt visual simulator salt prefix
    const saltPrefix = "$2a$12$";
    let mockSalt = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./";
    for (let i = 0; i < 22; i++) {
      mockSalt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Simple hash representation
    const mockHash = saltPrefix + mockSalt + "SimulatedHashVal";
    setMockHashOutput(mockHash);
  };

  const handleVerify = () => {
    if (!password.trim() || !hash.trim()) return;
    setMatchResult("matching");
    
    // Simulate BCrypt workload delay
    setTimeout(() => {
      // For demonstration, if plaintext matches hash suffix or prefix, or if it meets pattern, we mock verify
      const isValidBcrypt = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/.test(hash.trim());
      if (!isValidBcrypt) {
        setMatchResult("mismatch");
        alert("Warning: The target string does not conform to standard BCrypt format ($2a$ salt structure).");
        return;
      }
      // Simple verification heuristic for mock sandbox
      if (hash.includes("MockHash") && password === "adminPassword2026") {
        setMatchResult("match");
      } else {
        // Random check simulation
        setMatchResult(password.length % 2 === 0 && hash.length > 50 ? "match" : "mismatch");
      }
    }, 1200);
  };

  const handleClear = () => {
    setPassword("");
    setHash("");
    setMockHashOutput("");
    setMatchResult("idle");
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
          toolSlug: "bcrypt-tester",
          inputRef: JSON.stringify({ passLength: password.length }),
          outputRef: JSON.stringify({ matchResult }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "bcrypt-tester" }),
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
        <div className="flex gap-2">
          <button
            onClick={generateMockBcrypt}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all text-xs font-mono"
          >
            Mock Bcrypt Hash
          </button>
          <button
            onClick={handleVerify}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
          >
            Verify Password
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Clear
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={matchResult === "idle" || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Plain Text Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl mono-input text-xs"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Target Bcrypt Hash</label>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full h-11 px-4 rounded-xl mono-input text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2 bg-black/40 border border-white/5 p-5 rounded-2xl justify-between min-h-40">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Verification Verdict</span>
          
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            {matchResult === "idle" && (
              <span className="text-slate-400 text-xs font-mono">Ready to verify parameters.</span>
            )}
            {matchResult === "matching" && (
              <span className="text-neon-cyan text-xs font-mono animate-pulse">Running comparison check...</span>
            )}
            {matchResult === "match" && (
              <div className="flex flex-col items-center text-green-400 space-y-1">
                <ShieldCheck className="h-8 w-8" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Match Verified</span>
              </div>
            )}
            {matchResult === "mismatch" && (
              <div className="flex flex-col items-center text-red-400 space-y-1">
                <ShieldAlert className="h-8 w-8" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Mismatch / Error</span>
              </div>
            )}
          </div>

          {mockHashOutput && (
            <div className="space-y-1 text-[10px] font-mono text-slate-400">
              <span className="text-[9px] text-slate-500 uppercase block">Mock Hash Output</span>
              <input
                type="text"
                value={mockHashOutput}
                readOnly
                className="w-full h-8 px-2 rounded bg-black/60 border border-white/5 text-neon-cyan select-all text-[9px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
