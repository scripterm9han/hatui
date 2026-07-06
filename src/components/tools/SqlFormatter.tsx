"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function SqlFormatter() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const handleFormat = () => {
    if (!input.trim()) return;

    // 1. Tokenize and normalize spaces
    let sql = input.replace(/\s+/g, " ").trim();

    // 2. Define standard SQL keywords
    const keywords = [
      "SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT", "RIGHT", 
      "INNER", "OUTER", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", 
      "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "UNION"
    ];

    // 3. Capitalize keywords
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      sql = sql.replace(regex, keyword);
    });

    // 4. Place linebreaks before major keywords
    const breakKeywords = [
      "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", 
      "LIMIT", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", 
      "INSERT", "VALUES", "UPDATE", "SET", "DELETE", "UNION"
    ];

    breakKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\s?\\b${keyword}\\b\\s?`, "g");
      sql = sql.replace(regex, `\n${keyword} `);
    });

    // 5. Indent logical conditionals (AND, OR, ON)
    const indentKeywords = ["AND", "OR", "ON"];
    indentKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\s?\\b${keyword}\\b\\s?`, "g");
      sql = sql.replace(regex, `\n  ${keyword} `);
    });

    // 6. Clean up trailing linebreaks and spaces
    setOutput(sql.trim());
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
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
    if (!input.trim()) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "sql-formatter",
          inputRef: JSON.stringify({ rawExcerpt: input.substring(0, 100) + "..." }),
          outputRef: JSON.stringify({ formattedSql: (output || input).substring(0, 5000) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "sql-formatter" }),
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
            onClick={handleFormat}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
          >
            <Play className="h-3.5 w-3.5" />
            Format SQL
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Trash
          </button>
          <button
            onClick={handleCopy}
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy SQL"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!input || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Raw SQL Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT id, name, email FROM users WHERE plan = 'free' AND created_at > '2026-01-01' ORDER BY created_at DESC LIMIT 10;"
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Beautified Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted SQL statement..."
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
