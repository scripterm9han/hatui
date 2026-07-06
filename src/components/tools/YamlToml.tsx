"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function YamlToml() {
  const { data: session } = useSession();
  const [input, setInput] = useState("title: Hatiyar App\nversion: 1.2.0\nauthor:\n  name: Adwait\n  email: adwait@hatiyar.in");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const parseYaml = (yamlStr: string): any => {
    const lines = yamlStr.split("\n");
    const result: Record<string, any> = {};
    const stack: { indent: number; ref: any }[] = [{ indent: -1, ref: result }];

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const indent = line.length - line.trimStart().length;
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) continue;

      const key = trimmed.substring(0, colonIdx).trim();
      const valStr = trimmed.substring(colonIdx + 1).trim();

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const currentParent = stack[stack.length - 1].ref;

      if (valStr === "") {
        const newObj = {};
        currentParent[key] = newObj;
        stack.push({ indent, ref: newObj });
      } else {
        let val: any = valStr;
        if (valStr.startsWith('"') && valStr.endsWith('"')) val = valStr.slice(1, -1);
        else if (valStr === "true") val = true;
        else if (valStr === "false") val = false;
        else if (!isNaN(Number(valStr))) val = Number(valStr);
        currentParent[key] = val;
      }
    }
    return result;
  };

  const stringifyToml = (obj: any, prefix = ""): string => {
    let toml = "";
    const tables: { key: string; val: any }[] = [];

    Object.keys(obj).forEach((k) => {
      const val = obj[k];
      if (typeof val === "object" && val !== null) {
        tables.push({ key: k, val });
      } else {
        const formatVal = typeof val === "string" ? `"${val}"` : val;
        toml += `${k} = ${formatVal}\n`;
      }
    });

    tables.forEach(({ key, val }) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      toml += `\n[${fullPath}]\n` + stringifyToml(val, fullPath);
    });

    return toml.trim();
  };

  const convertYamlToToml = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      const parsed = parseYaml(input);
      const toml = stringifyToml(parsed);
      setOutput(toml);
    } catch (err: any) {
      setError(err.message || "Failed to parse YAML syntax.");
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
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
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
          toolSlug: "yaml-toml",
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
          body: JSON.stringify({ toolSlug: "yaml-toml" }),
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
          onClick={convertYamlToToml}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <Play className="h-3.5 w-3.5" />
          YAML to TOML
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy TOML"}
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
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">TOML Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="TOML configuration will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
