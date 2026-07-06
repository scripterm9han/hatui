"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Save, Trash2 } from "lucide-react";

export default function CaseConverter() {
  const { data: session } = useSession();
  const [input, setInput] = useState("Hatiyar engineering tools are fast");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const convertCase = (type: "upper" | "lower" | "title" | "camel" | "snake" | "kebab") => {
    if (!input.trim()) return;
    
    let res = "";
    const cleanInput = input.trim();

    switch (type) {
      case "upper":
        res = cleanInput.toUpperCase();
        break;
      case "lower":
        res = cleanInput.toLowerCase();
        break;
      case "title":
        res = cleanInput.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        break;
      case "camel":
        res = cleanInput
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, "");
        break;
      case "snake":
        res = cleanInput
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/-+/g, "_");
        break;
      case "kebab":
        res = cleanInput
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/_+/g, "-");
        break;
    }
    setOutput(res);
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
          toolSlug: "case-converter",
          inputRef: JSON.stringify({ rawExcerpt: input.substring(0, 50) + "..." }),
          outputRef: JSON.stringify({ caseResultExcerpt: (output || input).substring(0, 500) }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "case-converter" }),
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
        {/* Converters list */}
        <div className="flex flex-wrap gap-1.5">
          {(["upper", "lower", "title", "camel", "snake", "kebab"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => convertCase(mode)}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all uppercase tracking-wider"
            >
              {mode}
            </button>
          ))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Raw Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-60 w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Transformed Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Click case style buttons above..."
            className="h-60 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
