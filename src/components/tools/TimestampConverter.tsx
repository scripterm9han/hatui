"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2 } from "lucide-react";

export default function TimestampConverter() {
  const { data: session } = useSession();
  const [timestamp, setTimestamp] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [localDate, setLocalDate] = useState("");
  const [utcDate, setUtcDate] = useState("");
  const [targetTimestamp, setTargetTimestamp] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const convertTimestamp = (ts: string) => {
    if (!ts) return;
    try {
      const parsed = Number(ts);
      if (isNaN(parsed)) throw new Error();
      
      // Determine if seconds or milliseconds
      const date = ts.length > 11 ? new Date(parsed) : new Date(parsed * 1000);
      setLocalDate(date.toString());
      setUtcDate(date.toUTCString());
    } catch {
      setLocalDate("Invalid Timestamp");
      setUtcDate("Invalid Timestamp");
    }
  };

  const convertDate = (dt: string) => {
    if (!dt) return;
    try {
      const parsed = Date.parse(dt);
      if (isNaN(parsed)) throw new Error();
      setTargetTimestamp(Math.floor(parsed / 1000).toString());
    } catch {
      setTargetTimestamp("Invalid Date format");
    }
  };

  useEffect(() => {
    // Initialize with current time
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    
    const localNow = new Date();
    // Format YYYY-MM-DDTHH:MM
    const tzoffset = localNow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(localNow.getTime() - tzoffset).toISOString().slice(0, 16);
    setDateStr(localISOTime);
  }, []);

  useEffect(() => {
    convertTimestamp(timestamp);
  }, [timestamp]);

  useEffect(() => {
    convertDate(dateStr);
  }, [dateStr]);

  const handleCopy = async (txt: string) => {
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
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
          toolSlug: "timestamp-converter",
          inputRef: JSON.stringify({ timestamp }),
          outputRef: JSON.stringify({ localDate, utcDate }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "timestamp-converter" }),
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
      <div className="flex justify-between border-b border-white/5 pb-4">
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          Epoch & Date Parser
        </h4>
        <div className="flex gap-2">
          <button
            onClick={handleSaveOutput}
            className="px-3 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timestamp to Date */}
        <div className="glass-card rounded-xl border border-border-card p-5 space-y-4 bg-bg-darker/20">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">
            Epoch Timestamp to Date
          </span>
          <div className="space-y-3">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Unix Timestamp (Seconds or Ms)</label>
              <input
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="h-10 px-3 rounded-lg mono-input text-xs"
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 text-[10px] font-mono">
                <span className="text-slate-500">Local Time:</span>
                <span className="text-neon-cyan font-bold truncate max-w-[150px]">{localDate}</span>
                <button onClick={() => handleCopy(localDate)} className="text-slate-500 hover:text-white ml-2">
                  Copy
                </button>
              </div>

              <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 text-[10px] font-mono">
                <span className="text-slate-500">UTC Time:</span>
                <span className="text-neon-violet font-bold truncate max-w-[150px]">{utcDate}</span>
                <button onClick={() => handleCopy(utcDate)} className="text-slate-500 hover:text-white ml-2">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date to Timestamp */}
        <div className="glass-card rounded-xl border border-border-card p-5 space-y-4 bg-bg-darker/20">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">
            Date to Epoch Timestamp
          </span>
          <div className="space-y-3">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Input Datetime string</label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="h-10 px-3 rounded-lg mono-input text-xs text-white"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-white/5 text-[10px] font-mono">
                <span className="text-slate-500">Epoch Seconds:</span>
                <span className="text-neon-cyan font-bold">{targetTimestamp}</span>
                <button onClick={() => handleCopy(targetTimestamp)} className="text-slate-500 hover:text-white ml-2">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {copied && (
        <div className="text-center text-xs font-mono text-green-400">
          Copied to clipboard successfully!
        </div>
      )}
    </div>
  );
}
