"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function YamlJson() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const convertYamlToJson = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      const lines = input.split("\n");
      const result: Record<string, any> = {};
      const stack: { indent: number; obj: Record<string, any> }[] = [{ indent: -2, obj: result }];

      lines.forEach((line) => {
        const indent = line.search(/\S/);
        if (indent === -1) return; // Empty line

        const clean = line.trim();
        if (clean.startsWith("#")) return; // Comment

        // Parse key: value pattern
        const colonIdx = clean.indexOf(":");
        if (colonIdx === -1) {
          throw new Error("Invalid YAML syntax: Missing colon (:) on some lines.");
        }

        const key = clean.substring(0, colonIdx).trim();
        let valStr = clean.substring(colonIdx + 1).trim();

        // Type conversion
        let val: any = valStr;
        if (valStr.startsWith('"') && valStr.endsWith('"')) {
          val = valStr.substring(1, valStr.length - 1);
        } else if (valStr === "true") {
          val = true;
        } else if (valStr === "false") {
          val = false;
        } else if (valStr === "null") {
          val = null;
        } else if (!isNaN(Number(valStr)) && valStr !== "") {
          val = Number(valStr);
        }

        // Adjust parent object stack based on indentation depth
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const currentParent = stack[stack.length - 1].obj;
        
        if (valStr === "") {
          const newObj = {};
          currentParent[key] = newObj;
          stack.push({ indent, obj: newObj });
        } else {
          currentParent[key] = val;
        }
      });

      setOutput(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message || "Failed to parse YAML. Check indentation spacing.");
      setOutput("");
    }
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
          toolSlug: "yaml-json",
          inputRef: JSON.stringify({ size: input.length }),
          outputRef: JSON.stringify({ size: output.length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "yaml-json" }),
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
            onClick={convertYamlToJson}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
          >
            <Play className="h-3.5 w-3.5" />
            Convert to JSON
          </button>
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
            disabled={!output && !input}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy JSON"}
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
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">YAML Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="name: Hatiyar&#10;version: 1&#10;meta:&#10;  active: true"
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">JSON Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="JSON code will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
