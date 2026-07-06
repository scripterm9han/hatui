"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2 } from "lucide-react";

export default function NumberWords() {
  const { data: session } = useSession();
  const [inputVal, setInputVal] = useState("12345");
  const [words, setWords] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const scales = ["", "thousand", "million", "billion"];

  const translateTriplets = (num: number): string => {
    let res = "";
    if (num >= 100) {
      res += ones[Math.floor(num / 100)] + " hundred ";
      num %= 100;
    }
    if (num >= 20) {
      res += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    if (num > 0) {
      res += ones[num] + " ";
    }
    return res.trim();
  };

  const convertNumberToWords = (numStr: string) => {
    setError(null);
    if (!numStr.trim()) {
      setWords("");
      return;
    }
    
    try {
      const num = parseInt(numStr.trim());
      if (isNaN(num)) {
        throw new Error("Input must be a valid integer number.");
      }
      if (num === 0) {
        setWords("zero");
        return;
      }

      let absNum = Math.abs(num);
      let res = "";
      let scaleIdx = 0;

      while (absNum > 0) {
        const triplet = absNum % 1000;
        if (triplet > 0) {
          const tripletStr = translateTriplets(triplet);
          const scaleStr = scales[scaleIdx] ? ` ${scales[scaleIdx]} ` : " ";
          res = tripletStr + scaleStr + res;
        }
        absNum = Math.floor(absNum / 1000);
        scaleIdx++;
      }

      let outputWords = res.trim();
      if (num < 0) {
        outputWords = "negative " + outputWords;
      }
      setWords(outputWords.charAt(0).toUpperCase() + outputWords.slice(1));
    } catch (err: any) {
      setError(err.message || "Failed to convert number.");
      setWords("");
    }
  };

  useEffect(() => {
    convertNumberToWords(inputVal);
  }, [inputVal]);

  const handleClear = () => {
    setInputVal("");
    setWords("");
    setError(null);
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    if (!words) return;
    try {
      await navigator.clipboard.writeText(words);
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
    if (!words) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "number-words",
          inputRef: JSON.stringify({ inputVal }),
          outputRef: JSON.stringify({ words }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "number-words" }),
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
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Number to English Words
        </h4>

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
            disabled={!words}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Words"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!words || saveStatus === "saving"}
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
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Number Integer Input</label>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full h-11 px-4 rounded-xl mono-input text-xs"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Word Representation Output</label>
          <textarea
            value={words}
            readOnly
            placeholder="Words translation will appear here..."
            className="h-24 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-bold font-mono"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
