"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Info, Save, Trash2 } from "lucide-react";

export default function RegexTester() {
  const { data: session } = useSession();
  const [regex, setRegex] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Welcome to Hatiyar! Reach out to us at support@hatiyar.in or info@hatiyar.in.");
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!regex) {
      setMatches([]);
      setError(null);
      return;
    }
    try {
      const re = new RegExp(regex, flags.includes("g") ? flags : flags + "g"); // Ensure 'g' to find all matches
      setError(null);

      const found: any[] = [];
      let match;
      let iterations = 0;
      
      // Reset regex index
      re.lastIndex = 0;

      // Exec loop
      while ((match = re.exec(text)) !== null) {
        iterations++;
        if (iterations > 1000) break; // Prevent infinite loop for buggy regexes

        found.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1),
        });

        // Prevent infinite loops on empty matches
        if (match[0].length === 0) {
          re.lastIndex++;
        }
        
        // If not global search, stop after first match
        if (!flags.includes("g")) break;
      }
      setMatches(found);
    } catch (err: any) {
      setError(err.message || "Invalid Regular Expression");
      setMatches([]);
    }
  }, [regex, flags, text]);

  const handleClear = () => {
    setRegex("");
    setText("");
    setMatches([]);
    setError(null);
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(matches, null, 2));
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
    if (!regex || !text) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "regex-tester",
          inputRef: JSON.stringify({ regex, flags, text }),
          outputRef: JSON.stringify({ matchesCount: matches.length, matches }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "regex-tester" }),
        });
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  };

  // Helper to render highlighted match overlay
  const renderHighlightedText = () => {
    if (!regex || error || matches.length === 0) {
      return text;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((m, i) => {
      // Add text before match
      if (m.index > lastIndex) {
        elements.push(text.substring(lastIndex, m.index));
      }

      // Add highlighted match
      elements.push(
        <span
          key={`match-${i}`}
          className="bg-neon-cyan/20 text-neon-cyan border-b-2 border-neon-cyan/80 font-semibold px-0.5 rounded-sm"
          title={`Match ${i + 1}\nGroups: ${JSON.stringify(m.groups)}`}
        >
          {m.match}
        </span>
      );

      lastIndex = m.index + m.length;
    });

    // Add trailing text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm select-none">/</span>
            <input
              type="text"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              placeholder="Enter regular expression..."
              className="w-full h-10 pl-5 pr-8 rounded-lg mono-input text-sm"
              spellCheck="false"
            />
            <span className="absolute right-3 top-2.5 text-slate-500 font-mono text-sm select-none">/</span>
          </div>
          
          <div className="w-24">
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))}
              placeholder="flags"
              className="w-full h-10 px-3 rounded-lg mono-input text-sm text-center"
              title="Regex flags (e.g. g, i, m, s)"
            />
          </div>
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
            onClick={handleCopy}
            disabled={matches.length === 0}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied JSON" : "Copy Matches"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!regex || !text || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>Regex Error: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Test Text Area */}
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Test String</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Insert test string here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        {/* Live Highlighted Visualization */}
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Highlighted Matches</label>
          <div className="h-72 w-full p-4 rounded-xl border border-white/5 bg-black/60 text-sm overflow-y-auto whitespace-pre-wrap break-all font-mono">
            {renderHighlightedText()}
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="glass-card rounded-xl border border-border-card p-6">
        <h3 className="text-lg font-semibold text-white font-sans flex items-center gap-2 mb-4">
          Matches & Capture Groups
          <span className="px-2 py-0.5 rounded-md bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-mono">
            {matches.length} matches
          </span>
        </h3>

        {matches.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {matches.map((m, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-bg-darker/60 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="text-neon-cyan font-bold mr-2">#{idx + 1}</span>
                  <span className="text-white bg-slate-800/80 px-2 py-1 rounded select-all font-mono">{m.match}</span>
                  <span className="text-slate-500 ml-3">index: {m.index}</span>
                </div>
                {m.groups && m.groups.length > 0 && m.groups.some((g: any) => g !== undefined) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-slate-500">groups:</span>
                    {m.groups.map((group: string, gIdx: number) => (
                      group !== undefined && (
                        <span key={gIdx} className="bg-neon-violet/10 border border-neon-violet/20 text-neon-violet px-2 py-0.5 rounded">
                          {gIdx + 1}: {group}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm font-mono">
            No matches found.
          </div>
        )}
      </div>
    </div>
  );
}
