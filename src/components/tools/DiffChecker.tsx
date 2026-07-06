"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function DiffChecker() {
  const { data: session } = useSession();
  const [text1, setText1] = useState("Hello World\nHatiyar is a fast engineering tool\nFree tier ads are active");
  const [text2, setText2] = useState("Hello World!\nHatiyar is a premium developer tool\nPro tier active");
  const [diffLines, setDiffLines] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const computeDiff = () => {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const maxLines = Math.max(lines1.length, lines2.length);
    const diff: any[] = [];

    for (let i = 0; i < maxLines; i++) {
      const l1 = lines1[i] !== undefined ? lines1[i] : "";
      const l2 = lines2[i] !== undefined ? lines2[i] : "";

      if (l1 === l2) {
        diff.push({ type: "equal", val1: l1, val2: l2 });
      } else {
        diff.push({ type: "diff", val1: l1, val2: l2 });
      }
    }
    setDiffLines(diff);
  };

  const handleClear = () => {
    setText1("");
    setText2("");
    setDiffLines([]);
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
          toolSlug: "diff-checker",
          inputRef: JSON.stringify({ length1: text1.length, length2: text2.length }),
          outputRef: JSON.stringify({ diffLinesCount: diffLines.length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "diff-checker" }),
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
            onClick={computeDiff}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
          >
            <Play className="h-3.5 w-3.5" />
            Compare Text
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
            onClick={handleSaveOutput}
            disabled={!text1 && !text2}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Output"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Original Text (Block A)</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="h-48 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Modified Text (Block B)</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="h-48 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>
      </div>

      {diffLines.length > 0 && (
        <div className="glass-card rounded-xl border border-border-card p-6 bg-bg-darker/40 space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Diff Comparisons</span>
          <div className="border border-white/5 rounded-lg overflow-hidden font-mono text-[10px] divide-y divide-white/5">
            {diffLines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2">
                {line.type === "equal" ? (
                  <>
                    <div className="p-2.5 bg-slate-900/10 text-slate-500 border-r border-white/5 truncate">{line.val1}</div>
                    <div className="p-2.5 bg-slate-900/10 text-slate-500 truncate">{line.val2}</div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 bg-red-950/20 text-red-400 border-r border-white/5 truncate">
                      <span className="text-red-600 mr-2">-</span>{line.val1 || " "}
                    </div>
                    <div className="p-2.5 bg-green-950/20 text-green-400 truncate">
                      <span className="text-green-600 mr-2">+</span>{line.val2 || " "}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
