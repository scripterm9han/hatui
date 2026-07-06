"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, RefreshCw, Save, Trash2 } from "lucide-react";

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", 
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", 
  "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud", 
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", 
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", 
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", 
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", 
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

export default function LoremIpsum() {
  const { data: session } = useSession();
  const [count, setCount] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const generateLorem = () => {
    const list: string[] = [];

    const generateSentence = () => {
      const len = Math.floor(Math.random() * 8) + 6; // 6 to 13 words
      const words: string[] = [];
      for (let i = 0; i < len; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      const sentence = words.join(" ");
      return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
    };

    const generateParagraph = () => {
      const len = Math.floor(Math.random() * 4) + 3; // 3 to 6 sentences
      const sentences: string[] = [];
      for (let i = 0; i < len; i++) {
        sentences.push(generateSentence());
      }
      return sentences.join(" ");
    };

    if (type === "paragraphs") {
      const qty = Math.min(Math.max(1, count), 50);
      for (let i = 0; i < qty; i++) {
        list.push(generateParagraph());
      }
      setOutput(list.join("\n\n"));
    } else if (type === "sentences") {
      const qty = Math.min(Math.max(1, count), 100);
      for (let i = 0; i < qty; i++) {
        list.push(generateSentence());
      }
      setOutput(list.join(" "));
    } else {
      const qty = Math.min(Math.max(5, count), 1000);
      const words: string[] = [];
      for (let i = 0; i < qty; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      setOutput(words.join(" "));
    }
  };

  useEffect(() => {
    generateLorem();
  }, []);

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
    if (!output) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "lorem-ipsum",
          inputRef: JSON.stringify({ count, type }),
          outputRef: JSON.stringify({ excerpt: output.substring(0, 500) + "..." }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "lorem-ipsum" }),
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Type:</label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as any;
                setType(newType);
                setCount(newType === "words" ? 50 : 3);
              }}
              className="h-9 px-3 rounded-lg mono-input text-xs bg-black"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Quantity:</label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-16 h-9 px-2 rounded-lg mono-input text-xs text-center"
            />
          </div>
          
          <button
            onClick={generateLorem}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Generate Text
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
            disabled={!output}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Text"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!output || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Placeholder Output</label>
        <textarea
          value={output}
          readOnly
          className="h-80 w-full p-4 rounded-xl mono-input text-sm resize-none bg-black/60 border-white/5 text-slate-300 font-sans leading-relaxed"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
