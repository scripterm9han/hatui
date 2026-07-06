"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function LoremCode() {
  const { data: session } = useSession();
  const [lang, setLang] = useState<"js" | "html" | "sql" | "python">("js");
  const [lines, setLines] = useState(10);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const codeSnippets = {
    js: [
      "const fetchUserData = async (userId) => {",
      "  try {",
      "    const response = await fetch(`/api/users/${userId}`);",
      "    const data = await response.json();",
      "    if (!response.ok) throw new Error(data.message);",
      "    return { success: true, user: data };",
      "  } catch (error) {",
      "    console.error('Failed to load user:', error.message);",
      "    return { success: false, error: error.message };",
      "  }",
      "};"
    ],
    html: [
      "<div className='flex items-center gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800'>",
      "  <div className='h-10 w-10 rounded-full bg-neon-cyan/10 flex items-center justify-center'>",
      "    <span className='text-neon-cyan font-bold font-mono'>H</span>",
      "  </div>",
      "  <div className='flex-1 min-w-0'>",
      "    <h3 className='text-sm font-bold text-white truncate'>Mock Card Header</h3>",
      "    <p className='text-xs text-slate-400 truncate'>Placeholder card metadata description text.</p>",
      "  </div>",
      "  <button className='px-3 py-1.5 rounded-lg bg-neon-cyan text-black text-xs font-bold font-mono'>",
      "    Save",
      "  </button>",
      "</div>"
    ],
    sql: [
      "SELECT u.id, u.email, s.plan, COUNT(usage.id) as executions",
      "FROM users u",
      "LEFT JOIN subscriptions s ON u.id = s.user_id",
      "LEFT JOIN tool_usages usage ON u.id = usage.user_id",
      "WHERE s.status = 'ACTIVE' AND usage.created_at >= NOW() - INTERVAL '30 days'",
      "GROUP BY u.id, u.email, s.plan",
      "ORDER BY executions DESC",
      "LIMIT 10;"
    ],
    python: [
      "def calculate_sentiment(text: str) -> dict:",
      "    positive_words = {'fast', 'premium', 'cinematic', 'secure', 'high-performance'}",
      "    negative_words = {'slow', 'cluttered', 'buggy', 'error', 'fails'}",
      "    tokens = text.lower().split()",
      "    pos_count = sum(1 for t in tokens if t in positive_words)",
      "    neg_count = sum(1 for t in tokens if t in negative_words)",
      "    score = (pos_count - neg_count) / (pos_count + neg_count + 1e-6)",
      "    return {'sentiment_score': round(score, 2), 'verdict': 'POSITIVE' if score > 0 else 'NEGATIVE'}"
    ]
  };

  const generateCode = () => {
    const list = codeSnippets[lang];
    const sliced = list.slice(0, lines).join("\n");
    setCode(sliced);
  };

  const handleClear = () => {
    setCode("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
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
          toolSlug: "lorem-code",
          inputRef: JSON.stringify({ lang, lines }),
          outputRef: JSON.stringify({ isSaved: true }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "lorem-code" }),
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
        <div className="flex gap-2 items-center text-xs font-mono">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="h-9 px-2 rounded-lg bg-black border border-slate-800"
          >
            <option value="js">JavaScript (Node/ES6)</option>
            <option value="html">HTML Layout Card</option>
            <option value="sql">SQL Query Aggregation</option>
            <option value="python">Python Sentiment Function</option>
          </select>

          <input
            type="number"
            min="2"
            max="12"
            value={lines}
            onChange={(e) => setLines(Math.max(2, parseInt(e.target.value) || 2))}
            className="w-16 h-9 px-2 rounded-lg mono-input text-center"
          />
          <span className="text-slate-500">Lines</span>

          <button
            onClick={generateCode}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all"
          >
            Generate Snippet
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
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Snippet"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!code || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      {code && (
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Placeholder Code Snippet</label>
          <textarea
            value={code}
            readOnly
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
