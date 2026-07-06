"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

type MiscToolType = "date-diff" | "relative" | "seconds" | "words-num";

export default function MiscUtils({ defaultTool = "date-diff" }: { defaultTool?: MiscToolType }) {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<MiscToolType>(defaultTool);
  const [dateStart, setDateStart] = useState("2026-01-01");
  const [dateEnd, setDateEnd] = useState("2026-12-31");
  const [secondsVal, setSecondsVal] = useState(3665);
  const [wordsInput, setWordsInput] = useState("one hundred twenty three");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const runMiscTool = () => {
    setError(null);
    try {
      let res = "";
      switch (activeTool) {
        case "date-diff": {
          const d1 = new Date(dateStart);
          const d2 = new Date(dateEnd);
          if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            throw new Error("Invalid date parameters.");
          }
          const diffMs = Math.abs(d2.getTime() - d1.getTime());
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const diffWeeks = (diffDays / 7).toFixed(1);
          res = `Start Date: ${dateStart}\nEnd Date: ${dateEnd}\n\nDifference:\n${diffDays} Days\n${diffWeeks} Weeks`;
          break;
        }
        case "relative": {
          const target = new Date(dateStart);
          const now = new Date();
          const diffSeconds = Math.round((target.getTime() - now.getTime()) / 1000);
          
          let relative = "";
          const absSeconds = Math.abs(diffSeconds);
          if (absSeconds < 60) relative = `${absSeconds} seconds`;
          else if (absSeconds < 3600) relative = `${Math.round(absSeconds / 60)} minutes`;
          else if (absSeconds < 86400) relative = `${Math.round(absSeconds / 3600)} hours`;
          else relative = `${Math.round(absSeconds / 86400)} days`;

          res = `Target: ${dateStart}\nRelative to now: ${diffSeconds > 0 ? "in " + relative : relative + " ago"}`;
          break;
        }
        case "seconds": {
          let s = secondsVal;
          const hrs = Math.floor(s / 3600);
          s %= 3600;
          const mins = Math.floor(s / 60);
          const secs = s % 60;
          
          res = `Seconds: ${secondsVal}\nFormatted: ${hrs} hrs, ${mins} mins, ${secs} secs`;
          break;
        }
        case "words-num": {
          const clean = wordsInput.toLowerCase().trim();
          const wordMap: Record<string, number> = {
            zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
            eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
            twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
            hundred: 100, thousand: 1000, million: 1000000
          };
          
          const tokens = clean.split(/[\s-]+/);
          let total = 0;
          let current = 0;
          
          tokens.forEach((t) => {
            const num = wordMap[t];
            if (num === undefined) return;
            if (num === 100) {
              current *= 100;
            } else if (num === 1000 || num === 1000000) {
              total += current * num;
              current = 0;
            } else {
              current += num;
            }
          });
          
          const finalVal = total + current;
          res = `Words: "${wordsInput}"\nCalculated Numeric Value: ${finalVal}`;
          break;
        }
      }
      setResult(res.trim());
    } catch (err: any) {
      setError(err.message || "Execution error.");
      setResult("");
    }
  };

  useEffect(() => {
    runMiscTool();
  }, [dateStart, dateEnd, secondsVal, wordsInput, activeTool]);

  const handleClear = () => {
    setResult("");
    setError(null);
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOutput = async () => {
    if (!session) {
      alert("Please sign in to save outputs.");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: activeTool,
          inputRef: JSON.stringify({ activeTool }),
          outputRef: JSON.stringify({ result }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: activeTool }),
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
      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "date-diff", label: "Date Difference" },
          { id: "relative", label: "Relative Time" },
          { id: "seconds", label: "Seconds Formatter" },
          { id: "words-num", label: "Words to Numbers" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as MiscToolType);
              setSaveStatus("idle");
              setResult("");
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              activeTool === t.id
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">
        {/* Input Controls */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4 bg-bg-darker/20 text-xs font-mono text-slate-400">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">
            Parameters
          </span>

          {activeTool === "date-diff" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Start Date</label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">End Date</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
            </div>
          )}

          {activeTool === "relative" && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">Target Date Time</label>
              <input
                type="datetime-local"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="h-9 px-3 rounded-lg mono-input text-xs text-white"
              />
            </div>
          )}

          {activeTool === "seconds" && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">Elapsed Seconds</label>
              <input
                type="number"
                value={secondsVal}
                onChange={(e) => setSecondsVal(parseInt(e.target.value) || 0)}
                className="h-9 px-3 rounded-lg mono-input text-xs text-white"
              />
            </div>
          )}

          {activeTool === "words-num" && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">English Words String</label>
              <input
                type="text"
                value={wordsInput}
                onChange={(e) => setWordsInput(e.target.value)}
                className="h-9 px-3 rounded-lg mono-input text-xs text-white"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
            >
              Clear
            </button>
            <button
              onClick={handleCopy}
              disabled={!result}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Results"}
            </button>
            <button
              onClick={handleSaveOutput}
              disabled={!result || saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
            >
              Save Results
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Calculated Result</span>
          <textarea
            value={result}
            readOnly
            placeholder="Result will appear here..."
            className="w-full h-36 p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-bold font-mono"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
