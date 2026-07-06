"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Trash2 } from "lucide-react";

export default function WordCounter() {
  const { data: session } = useSession();
  const [text, setText] = useState("Hatiyar is an advanced developer engineering multi-tool suite containing 30 professional utilities. It works client-side at zero latency and provides instant results.");
  const [stats, setStats] = useState({
    chars: 0,
    charsNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readTime: 0,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const computeStats = () => {
    const cleanText = text.trim();
    if (!cleanText) {
      setStats({ chars: 0, charsNoSpaces: 0, words: 0, sentences: 0, paragraphs: 0, readTime: 0 });
      return;
    }

    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = cleanText.split(/\s+/).length;
    
    // Split sentences by . ? !
    const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    
    // Split paragraphs by newlines
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    
    // 200 words per minute average reading speed
    const readTime = Math.ceil(words / 200);

    setStats({ chars, charsNoSpaces, words, sentences, paragraphs, readTime });
  };

  useEffect(() => {
    computeStats();
  }, [text]);

  const handleClear = () => {
    setText("");
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
          toolSlug: "word-counter",
          inputRef: JSON.stringify({ charCount: stats.chars, wordCount: stats.words }),
          outputRef: JSON.stringify({ stats }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "word-counter" }),
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
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Text Analyzer Statistics
        </h4>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="px-3 h-8 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-mono"
          >
            Clear text
          </button>
          <button
            onClick={handleSaveOutput}
            className="px-3 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono"
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Editor panel */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write text here to analyze statistics..."
          className="h-64 w-full p-4 rounded-xl mono-input text-xs resize-none"
          spellCheck="false"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-lg border border-slate-800/80 p-4 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Characters</span>
            <span className="text-lg font-bold text-white font-mono">{stats.chars}</span>
          </div>

          <div className="glass-card rounded-lg border border-slate-800/80 p-4 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Words</span>
            <span className="text-lg font-bold text-neon-cyan font-mono">{stats.words}</span>
          </div>

          <div className="glass-card rounded-lg border border-slate-800/80 p-4 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Sentences</span>
            <span className="text-lg font-bold text-neon-violet font-mono">{stats.sentences}</span>
          </div>

          <div className="glass-card rounded-lg border border-slate-800/80 p-4 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Paragraphs</span>
            <span className="text-lg font-bold text-white font-mono">{stats.paragraphs}</span>
          </div>

          <div className="glass-card rounded-lg border border-slate-800/80 p-4 text-center space-y-1 col-span-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Est. Reading Speed</span>
            <span className="text-xs font-mono text-slate-300">~ {stats.readTime} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
}
