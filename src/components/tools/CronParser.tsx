"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2, Info } from "lucide-react";

export default function CronParser() {
  const { data: session } = useSession();
  const [expression, setExpression] = useState("*/15 9-17 * * 1-5");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const parseCron = () => {
    if (!expression.trim()) return;
    setError(null);
    try {
      const parts = expression.trim().split(/\s+/);
      if (parts.length !== 5) {
        throw new Error("Crontab expressions must contain exactly 5 space-separated fields.");
      }

      const [min, hr, dom, mon, dow] = parts;
      
      const describeField = (field: string, type: "min" | "hr" | "dom" | "mon" | "dow"): string => {
        if (field === "*") {
          return type === "min" ? "every minute" : type === "hr" ? "every hour" : "every day";
        }
        if (field.startsWith("*/")) {
          const step = field.slice(2);
          return `every ${step} ${type === "min" ? "minutes" : type === "hr" ? "hours" : "days"}`;
        }
        if (field.includes("-")) {
          const [start, end] = field.split("-");
          return `between ${type === "dow" ? getDayName(start) : start} and ${type === "dow" ? getDayName(end) : end}`;
        }
        return type === "dow" ? getDayName(field) : field;
      };

      const getDayName = (day: string) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const parsed = parseInt(day);
        return days[parsed] || day;
      };

      const minDesc = describeField(min, "min");
      const hrDesc = describeField(hr, "hr");
      const dowDesc = describeField(dow, "dow");

      let desc = `Runs ${minDesc}`;
      if (hr !== "*") desc += `, ${hrDesc}`;
      if (dow !== "*") desc += `, on ${dowDesc}`;
      desc += ".";

      setDescription(desc.charAt(0).toUpperCase() + desc.slice(1));
    } catch (err: any) {
      setError(err.message || "Failed to decode expression.");
      setDescription("");
    }
  };

  const handleCopy = async () => {
    if (!description) return;
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    setExpression("");
    setDescription("");
    setError(null);
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
          toolSlug: "cron-parser",
          inputRef: JSON.stringify({ expression }),
          outputRef: JSON.stringify({ description }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "cron-parser" }),
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
          onClick={parseCron}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <Play className="h-3.5 w-3.5" />
          Explain Cron Expression
        </button>

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
            disabled={!description}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Description"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!expression || saveStatus === "saving"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Cron Expression (5 fields)</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="w-full h-11 px-4 rounded-xl mono-input text-xs"
          />
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Fields: min hr dom mon dow (e.g. * * * * * or 0 0 * * *)
          </span>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Human Readable Translation</label>
          <textarea
            value={description}
            readOnly
            placeholder="Click explain above..."
            className="h-28 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
