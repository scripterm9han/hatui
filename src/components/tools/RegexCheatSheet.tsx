"use client";

import { useState } from "react";
import { Clipboard, Check, Info } from "lucide-react";

interface CheatItem {
  regex: string;
  desc: string;
  example: string;
}

export default function RegexCheatSheet() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sandboxPattern, setSandboxPattern] = useState("\\b\\w{5}\\b");
  const [sandboxText, setSandboxText] = useState("Hatiyar tools are extremely fast and secure");
  const [matches, setMatches] = useState<string[]>(["tools", "words"]);

  const cheatSheet: CheatItem[] = [
    { regex: "\\d", desc: "Matches any digit (0-9)", example: "3 matches in 'user_123'" },
    { regex: "\\w", desc: "Matches alphanumeric characters & underscores", example: "Matches 'a' in 'a!'" },
    { regex: "\\s", desc: "Matches any whitespace (spaces, tabs, linebreaks)", example: "Matches spaces" },
    { regex: ".", desc: "Matches any character except linebreaks", example: "Matches everything" },
    { regex: "^", desc: "Matches the start of a string line", example: "^Hello matches 'Hello'" },
    { regex: "$", desc: "Matches the end of a string line", example: "world$ matches 'world'" },
    { regex: "\\b", desc: "Matches word boundary limits", example: "\\bcat\\b matches word 'cat'" },
    { regex: "*", desc: "Matches 0 or more occurrences", example: "a* matches '', 'a', 'aa'" },
    { regex: "+", desc: "Matches 1 or more occurrences", example: "a+ matches 'a', 'aa'" },
    { regex: "?", desc: "Matches 0 or 1 occurrence (optional marker)", example: "colou?r matches 'color' & 'colour'" },
  ];

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const testSandbox = () => {
    if (!sandboxPattern.trim() || !sandboxText.trim()) {
      setMatches([]);
      return;
    }
    try {
      const reg = new RegExp(sandboxPattern, "g");
      const found = sandboxText.match(reg);
      setMatches(found ? Array.from(new Set(found)) : []);
    } catch {
      setMatches(["Invalid Regex Pattern"]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cheat Sheet Table */}
      <div className="glass-card rounded-xl border border-border-card p-5 bg-bg-darker/20 space-y-3">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">
          Common Regular Expression Tokens
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cheatSheet.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 text-xs font-mono"
            >
              <div className="min-w-0 space-y-1">
                <span className="text-neon-cyan font-bold block">{item.regex}</span>
                <span className="text-slate-400 block text-[10px] leading-relaxed">{item.desc}</span>
              </div>
              <button
                onClick={() => handleCopy(item.regex, idx)}
                className="p-2 rounded hover:bg-slate-900 text-slate-500 hover:text-neon-cyan transition-all shrink-0"
                title="Copy regex token"
              >
                {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Sandbox Tester */}
      <div className="glass-card rounded-xl border border-border-card p-5 bg-bg-darker/40 space-y-4">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">
          Interactive Token Sandbox
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">RegEx Pattern</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sandboxPattern}
                  onChange={(e) => setSandboxPattern(e.target.value)}
                  placeholder="e.g. \b\w{5}\b"
                  className="flex-1 h-9 px-3 rounded-lg mono-input text-xs"
                />
                <button
                  onClick={testSandbox}
                  className="px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
                >
                  Test
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Test String</label>
              <input
                type="text"
                value={sandboxText}
                onChange={(e) => setSandboxText(e.target.value)}
                className="w-full h-9 px-3 rounded-lg mono-input text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 bg-black/60 p-4 rounded-xl border border-white/5 justify-between min-h-24">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Found Unique Matches</span>
            <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-16">
              {matches.length > 0 ? (
                matches.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] font-mono">
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-[10px] font-mono">No matches found.</span>
              )}
            </div>
            <span className="text-[9px] font-mono text-slate-600 block flex items-center gap-1">
              <Info className="h-3 w-3" />
              Patterns are compiled with global (g) search flags.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
