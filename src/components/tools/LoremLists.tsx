"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function LoremLists() {
  const { data: session } = useSession();
  const [listType, setListType] = useState<"ul" | "ol">("ul");
  const [itemsCount, setItemsCount] = useState(5);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const phrases = [
    "Lorem ipsum dolor sit amet",
    "Consectetur adipiscing elit",
    "Integer molestie lorem at massa",
    "Facilisis in pretium nisl aliquet",
    "Nulla volutpat aliquam velit",
    "Faucibus porta lacus fringilla vel",
    "Aenean sit amet erat nunc",
    "Eget porttitor lorem"
  ];

  const generateList = () => {
    let html = listType === "ul" ? "<ul>\n" : "<ol>\n";
    for (let i = 0; i < itemsCount; i++) {
      const phrase = phrases[i % phrases.length];
      html += `  <li>${phrase}</li>\n`;
    }
    html += listType === "ul" ? "</ul>" : "</ol>";
    setOutput(html);
  };

  const handleClear = () => {
    setOutput("");
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
          toolSlug: "lorem-lists",
          inputRef: JSON.stringify({ listType, itemsCount }),
          outputRef: JSON.stringify({ isSaved: true }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "lorem-lists" }),
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
        <div className="flex gap-2 items-center text-xs font-mono text-slate-400">
          <select
            value={listType}
            onChange={(e) => setListType(e.target.value as any)}
            className="h-9 px-2 rounded-lg bg-black border border-slate-800"
          >
            <option value="ul">Unordered List (&lt;ul&gt;)</option>
            <option value="ol">Ordered List (&lt;ol&gt;)</option>
          </select>

          <input
            type="number"
            min="2"
            max="12"
            value={itemsCount}
            onChange={(e) => setItemsCount(Math.max(2, parseInt(e.target.value) || 2))}
            className="w-16 h-9 px-2 rounded-lg mono-input text-center"
          />
          <span className="text-slate-500">Items</span>

          <button
            onClick={generateList}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all"
          >
            Generate
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
            disabled={!output}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy HTML"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!output || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            Save Output
          </button>
        </div>
      </div>

      {output && (
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Generated List Markup</label>
          <textarea
            value={output}
            readOnly
            className="h-60 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
