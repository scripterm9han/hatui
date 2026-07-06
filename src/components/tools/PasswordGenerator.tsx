"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, RefreshCw, Save } from "lucide-react";

export default function PasswordGenerator() {
  const { data: session } = useSession();
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ score: 0, text: "Too Weak", color: "bg-red-500" });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const generatePassword = () => {
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numChars = "0123456789";
    const symChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let allowed = "";
    if (uppercase) allowed += upperChars;
    if (lowercase) allowed += lowerChars;
    if (numbers) allowed += numChars;
    if (symbols) allowed += symChars;

    if (!allowed) {
      setPassword("");
      return;
    }

    let generated = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      generated += allowed[array[i] % allowed.length];
    }

    setPassword(generated);
  };

  const evaluateStrength = (pass: string) => {
    if (!pass) {
      setStrength({ score: 0, text: "Too Short", color: "bg-slate-800" });
      return;
    }

    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (pass.length >= 16) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    // Normalize score to 1-4 scale
    let normalized = 1;
    if (score >= 6) normalized = 4; // Very Strong
    else if (score >= 4) normalized = 3; // Strong
    else if (score >= 2) normalized = 2; // Medium

    const meta = [
      { text: "Too Weak", color: "bg-red-500" },
      { text: "Weak", color: "bg-red-400" },
      { text: "Medium", color: "bg-orange-500" },
      { text: "Strong", color: "bg-yellow-500" },
      { text: "Very Strong", color: "bg-green-500" },
    ];

    setStrength({
      score: normalized,
      text: meta[normalized].text,
      color: meta[normalized].color,
    });
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols]);

  useEffect(() => {
    evaluateStrength(password);
  }, [password]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
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
    if (!password) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "password-generator",
          inputRef: JSON.stringify({ length, uppercase, lowercase, numbers, symbols }),
          outputRef: JSON.stringify({ strength: strength.text, isSaved: true }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "password-generator" }),
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
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
        {/* Controls */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-5">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Parameters</h3>

          {/* Length slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Password Length:</span>
              <span className="text-neon-cyan font-bold">{length} characters</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
          </div>

          {/* Checklist checkboxes */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
            <label className="flex items-center gap-2 text-slate-300 text-xs font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded bg-black border-white/10 text-neon-cyan focus:ring-0"
              />
              Uppercase
            </label>
            <label className="flex items-center gap-2 text-slate-300 text-xs font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
                className="rounded bg-black border-white/10 text-neon-cyan focus:ring-0"
              />
              Lowercase
            </label>
            <label className="flex items-center gap-2 text-slate-300 text-xs font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => setNumbers(e.target.checked)}
                className="rounded bg-black border-white/10 text-neon-cyan focus:ring-0"
              />
              Numbers
            </label>
            <label className="flex items-center gap-2 text-slate-300 text-xs font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
                className="rounded bg-black border-white/10 text-neon-cyan focus:ring-0"
              />
              Special Characters
            </label>
          </div>
        </div>

        {/* Output & Strength Indicator */}
        <div className="glass-card rounded-xl border border-border-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Generated Password</label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                readOnly
                placeholder="Click generate..."
                className="flex-1 h-11 px-4 rounded-lg mono-input text-xs font-mono text-neon-cyan font-bold select-all bg-black/60 border-white/5"
              />
              <button
                onClick={generatePassword}
                className="p-3 rounded-lg border border-slate-800 text-slate-400 hover:text-neon-cyan transition-all"
                title="Regenerate"
              >
                <RefreshCw className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Strength bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Strength:</span>
                <span className="font-bold text-white uppercase">{strength.text}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                      step <= strength.score ? strength.color : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopy}
              disabled={!password}
              className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg border border-slate-850 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            
            <button
              onClick={handleSaveOutput}
              disabled={!password || saveStatus === "saving"}
              className="w-full flex items-center justify-center gap-1.5 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
            >
              {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
