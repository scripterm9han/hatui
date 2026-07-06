"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Eye, Save, Trash2 } from "lucide-react";

export default function MarkdownPreviewer() {
  const { data: session } = useSession();
  const [markdown, setMarkdown] = useState(`# Live Markdown Previewer

Welcome to Hatiyar! Type some markdown on the left to see the result live.

## Features:
- Headers (H1, H2, H3)
- Bullet Lists
- Bold (**text**) and Italic (*text*) formatting
- Inline code \`const hello = "world"\`

### Try writing some code:
\`\`\`javascript
function test() {
  console.log("Hatiyar tools are fast!");
}
\`\`\`
`);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const handleClear = () => {
    setMarkdown("");
    setSaveStatus("idle");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
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
    if (!markdown) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "markdown-previewer",
          inputRef: JSON.stringify({ markdownLength: markdown.length }),
          outputRef: JSON.stringify({ markdown }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Log tool usage to DB too
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: "markdown-previewer" }),
        });
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    }
  };

  // Safe client-side parser mapping markdown lines to styled JSX elements
  const parseMarkdown = (md: string) => {
    if (!md) return <p className="text-slate-500 text-xs font-mono">No content to preview.</p>;
    
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];
    let insideCodeBlock = false;
    let codeContent: string[] = [];

    lines.forEach((line, idx) => {
      const clean = line.trim();

      if (clean.startsWith("```")) {
        if (insideCodeBlock) {
          // Close block
          elements.push(
            <pre
              key={`code-${idx}`}
              className="p-3 my-2 rounded-lg bg-black/80 border border-white/5 font-mono text-[11px] text-neon-cyan overflow-x-auto whitespace-pre"
            >
              {codeContent.join("\n")}
            </pre>
          );
          codeContent = [];
          insideCodeBlock = false;
        } else {
          // Open block
          insideCodeBlock = true;
        }
        return;
      }

      if (insideCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headers
      if (clean.startsWith("# ")) {
        elements.push(
          <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2 border-b border-white/5 pb-1">
            {clean.slice(2)}
          </h1>
        );
      } else if (clean.startsWith("## ")) {
        elements.push(
          <h2 key={idx} className="text-lg font-bold text-neon-cyan mt-4 mb-1.5">
            {clean.slice(3)}
          </h2>
        );
      } else if (clean.startsWith("### ")) {
        elements.push(
          <h3 key={idx} className="text-sm font-bold text-neon-violet mt-3 mb-1">
            {clean.slice(4)}
          </h3>
        );
      }
      // Bullet list items
      else if (clean.startsWith("- ") || clean.startsWith("* ")) {
        const itemText = clean.slice(2);
        elements.push(
          <li
            key={idx}
            className="text-slate-300 text-xs ml-4 list-disc leading-relaxed my-1"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }}
          />
        );
      }
      // Standard Paragraph
      else if (clean === "") {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p
            key={idx}
            className="text-slate-300 text-xs leading-relaxed my-1.5"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
          />
        );
      }
    });

    return elements;
  };

  // Helper to format bold, italic, and inline code segments
  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='text-slate-200 italic'>$1</em>")
      .replace(/`(.*?)`/g, "<code class='bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-neon-cyan font-mono'>$1</code>");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Eye className="h-4 w-4 text-neon-cyan" />
            Markdown Live Editor
          </span>
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
            disabled={!markdown}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-800 hover:border-neon-cyan/40 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all text-xs font-mono disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Markdown"}
          </button>
          <button
            onClick={handleSaveOutput}
            disabled={!markdown || saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-mono disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Markdown"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Editor Panel</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="h-[400px] w-full p-4 rounded-xl mono-input text-sm resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Formatted Preview</label>
          <div className="h-[400px] w-full p-6 rounded-xl border border-white/5 bg-black/60 overflow-y-auto font-sans text-slate-200">
            {parseMarkdown(markdown)}
          </div>
        </div>
      </div>
    </div>
  );
}
