"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2, RefreshCw } from "lucide-react";

export default function JsonCsv() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"json2csv" | "csv2json">("json2csv");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const jsonToCsv = (jsonStr: string) => {
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr)) {
      throw new Error("Input must be a JSON array of flat objects.");
    }
    if (arr.length === 0) return "";

    const headers = Object.keys(arr[0]);
    const csvRows = [headers.join(",")];

    for (const row of arr) {
      const values = headers.map((header) => {
        const val = row[header];
        const escapeStr = ("" + (val === null || val === undefined ? "" : val)).replace(/"/g, '\\"');
        return escapeStr.includes(",") ? `"${escapeStr}"` : escapeStr;
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  };

  const csvToJson = (csvStr: string) => {
    const lines = csvStr.split("\n").map((l) => l.trim()).filter((l) => l !== "");
    if (lines.length === 0) return "[]";

    const headers = lines[0].split(",");
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",");
      const obj: Record<string, any> = {};
      headers.forEach((header, idx) => {
        let val: any = row[idx] ? row[idx].trim() : "";
        // Clean double quotes
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(Number(val)) && val !== "") val = Number(val);
        
        obj[header.trim()] = val;
      });
      result.push(obj);
    }
    return JSON.stringify(result, null, 2);
  };

  const handleConvert = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      if (mode === "json2csv") {
        setOutput(jsonToCsv(input));
      } else {
        setOutput(csvToJson(input));
      }
    } catch (err: any) {
      setError(err.message || "Conversion failed. Please verify syntax.");
      setOutput("");
    }
  };

  const handleSwap = () => {
    setMode(mode === "json2csv" ? "csv2json" : "json2csv");
    setInput(output);
    setOutput(input);
    setError(null);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
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
          toolSlug: "json-csv",
          inputRef: JSON.stringify({ mode, size: input.length }),
          outputRef: JSON.stringify({ size: output.length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "json-csv" }),
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
            onClick={() => setMode("json2csv")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "json2csv"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            JSON to CSV
          </button>
          <button
            onClick={() => setMode("csv2json")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all border ${
              mode === "csv2json"
                ? "bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            CSV to JSON
          </button>
          <button
            onClick={handleSwap}
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-neon-cyan text-xs font-mono transition-all disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            Swap
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleConvert}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
          >
            Execute
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Output"}
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

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">
            {mode === "json2csv" ? "JSON Array Input" : "CSV Data Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "json2csv" ? '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]' : "id,name\n1,Alice\n2,Bob"}
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Converted Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
