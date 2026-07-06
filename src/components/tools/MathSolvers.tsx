"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

type MathToolType = "stats" | "gcd-lcm" | "prime" | "fibonacci" | "percentage";

export default function MathSolvers({ defaultTool = "stats" }: { defaultTool?: MathToolType }) {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<MathToolType>(defaultTool);
  const [inputVal, setInputVal] = useState("10, 20, 20, 40, 50");
  const [numA, setNumA] = useState(12);
  const [numB, setNumB] = useState(18);
  const [percentageA, setPercentageA] = useState(15);
  const [percentageB, setPercentageB] = useState(200);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const runMath = () => {
    setError(null);
    try {
      let res = "";
      switch (activeTool) {
        case "stats": {
          const arr = inputVal.split(",").map((v) => parseFloat(v.trim())).filter((v) => !isNaN(v));
          if (arr.length === 0) throw new Error("Please enter a valid comma-separated list of numbers.");
          
          // Mean
          const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
          
          // Median
          const sorted = [...arr].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          
          // Mode
          const counts: Record<number, number> = {};
          let maxCount = 0;
          let modeVal = sorted[0];
          arr.forEach((v) => {
            counts[v] = (counts[v] || 0) + 1;
            if (counts[v] > maxCount) {
              maxCount = counts[v];
              modeVal = v;
            }
          });

          res = `Numbers: [${sorted.join(", ")}]\nMean: ${mean.toFixed(2)}\nMedian: ${median}\nMode: ${modeVal} (Count: ${maxCount})`;
          break;
        }
        case "gcd-lcm": {
          const computeGcd = (x: number, y: number): number => (!y ? x : computeGcd(y, x % y));
          const gcdVal = computeGcd(numA, numB);
          const lcmVal = (numA * numB) / gcdVal;
          res = `Numbers: A = ${numA}, B = ${numB}\nGreatest Common Divisor (GCD): ${gcdVal}\nLeast Common Multiple (LCM): ${lcmVal}`;
          break;
        }
        case "prime": {
          const val = numA;
          if (val < 2) {
            res = `${val} is not a prime number. (Values must be >= 2)`;
            break;
          }
          let isPrime = true;
          const factors: number[] = [];
          let d = 2;
          let temp = val;
          while (temp > 1) {
            if (temp % d === 0) {
              factors.push(d);
              temp /= d;
            } else {
              d++;
            }
          }
          if (factors.length === 1) isPrime = true;
          else isPrime = false;

          res = `Number: ${val}\nPrime Status: ${isPrime ? "IS PRIME" : "NOT PRIME"}\nPrime Factors: ${factors.join(" × ")}`;
          break;
        }
        case "fibonacci": {
          const limit = Math.min(50, Math.max(1, numA));
          const sequence = [0, 1];
          for (let i = 2; i < limit; i++) {
            sequence.push(sequence[i - 1] + sequence[i - 2]);
          }
          res = `Fibonacci Series (First ${limit} terms):\n` + sequence.slice(0, limit).join(", ");
          break;
        }
        case "percentage": {
          const val = (percentageA / 100) * percentageB;
          res = `${percentageA}% of ${percentageB} = ${val.toFixed(2)}`;
          break;
        }
      }
      setResult(res.trim());
    } catch (err: any) {
      setError(err.message || "Calculation error.");
      setResult("");
    }
  };

  useEffect(() => {
    runMath();
  }, [inputVal, numA, numB, percentageA, percentageB, activeTool]);

  const handleClear = () => {
    setInputVal("");
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
          outputRef: JSON.stringify({ excerpt: result.substring(0, 100) }),
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
          { id: "stats", label: "Mean Median Mode" },
          { id: "gcd-lcm", label: "GCD & LCM" },
          { id: "prime", label: "Prime & Factors" },
          { id: "fibonacci", label: "Fibonacci Series" },
          { id: "percentage", label: "Percentage" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as MathToolType);
              setSaveStatus("idle");
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
        {/* Left Column: Tweakable Inputs */}
        <div className="glass-card rounded-xl border border-border-card p-6 space-y-4 bg-bg-darker/20 text-xs font-mono text-slate-400">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1">
            Input values
          </span>

          {activeTool === "stats" && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">Comma-Separated Numbers</label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="h-11 px-4 rounded-xl mono-input text-xs w-full text-white"
              />
            </div>
          )}

          {activeTool === "gcd-lcm" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Number A</label>
                <input
                  type="number"
                  value={numA}
                  onChange={(e) => setNumA(parseInt(e.target.value) || 0)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Number B</label>
                <input
                  type="number"
                  value={numB}
                  onChange={(e) => setNumB(parseInt(e.target.value) || 0)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
            </div>
          )}

          {activeTool === "prime" && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">Integer Value</label>
              <input
                type="number"
                value={numA}
                onChange={(e) => setNumA(parseInt(e.target.value) || 0)}
                className="h-9 px-3 rounded-lg mono-input text-xs text-white"
              />
            </div>
          )}

          {activeTool === "fibonacci" && (
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-slate-500 uppercase">Terms Count (max 50)</label>
              <input
                type="number"
                value={numA}
                onChange={(e) => setNumA(parseInt(e.target.value) || 0)}
                className="h-9 px-3 rounded-lg mono-input text-xs text-white"
              />
            </div>
          )}

          {activeTool === "percentage" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">What is X percent</label>
                <input
                  type="number"
                  value={percentageA}
                  onChange={(e) => setPercentageA(parseInt(e.target.value) || 0)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">of Y</label>
                <input
                  type="number"
                  value={percentageB}
                  onChange={(e) => setPercentageB(parseInt(e.target.value) || 0)}
                  className="h-9 px-3 rounded-lg mono-input text-xs text-white"
                />
              </div>
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
              disabled={saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
            >
              Save Results
            </button>
          </div>
        </div>

        {/* Right Column: Visual Result Card */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Calculated Result</span>
          <textarea
            value={result}
            readOnly
            className="w-full h-36 p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-bold font-mono"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
