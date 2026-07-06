"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Search } from "lucide-react";

type SheetType = "markdown" | "html" | "git" | "docker" | "sql" | "http";

interface CheatItem {
  cmd: string;
  desc: string;
}

export default function CheatSheets() {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<SheetType>("markdown");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const data: Record<SheetType, CheatItem[]> = {
    markdown: [
      { cmd: "# Header 1", desc: "Main level-1 heading" },
      { cmd: "## Header 2", desc: "Sub level-2 heading" },
      { cmd: "**bold text**", desc: "Bold styling markers" },
      { cmd: "*italic text*", desc: "Italic styling markers" },
      { cmd: "[Label](url)", desc: "Hyperlink redirection URL" },
      { cmd: "![Alt](img_url)", desc: "Visual image rendering tag" },
      { cmd: "`code`", desc: "Inline monospace code wrapper" },
      { cmd: "```\\ncode block\\n```", desc: "Fenced code block segments" },
      { cmd: "- Item", desc: "Bullet unordered list item" },
    ],
    html: [
      { cmd: "<h1>Header 1</h1>", desc: "Defines main page heading" },
      { cmd: "<p>Paragraph</p>", desc: "Wraps text blocks" },
      { cmd: "<a href='url'>Link</a>", desc: "Defines anchors redirect URLs" },
      { cmd: "<img src='url' alt='Alt' />", desc: "Renders graphics inline" },
      { cmd: "<strong>Bold</strong>", desc: "Casts strong visual emphasis" },
      { cmd: "<em>Italic</em>", desc: "Casts italicized emphasis" },
      { cmd: "<div class='card'>Card</div>", desc: "Division wrapper element" },
      { cmd: "<span id='label'>Label</span>", desc: "Inline styling container" },
    ],
    git: [
      { cmd: "git init", desc: "Scaffolds a new local repository" },
      { cmd: "git clone <url>", desc: "Clones a remote repository" },
      { cmd: "git add .", desc: "Stages all edits for tracking" },
      { cmd: "git commit -m \"message\"", desc: "Saves stages snapshot locally" },
      { cmd: "git push origin main", desc: "Uploads commits to remote main branch" },
      { cmd: "git pull origin main", desc: "Downloads latest remote edits" },
      { cmd: "git checkout -b <branch>", desc: "Creates and swaps to new branch" },
      { cmd: "git merge <branch>", desc: "Merges branch code updates" },
    ],
    docker: [
      { cmd: "docker build -t <tag> .", desc: "Builds a Docker image" },
      { cmd: "docker run -p 3000:3000 <image>", desc: "Spins up container instance mapping ports" },
      { cmd: "docker ps", desc: "Lists all running containers" },
      { cmd: "docker images", desc: "Lists all locally stored images" },
      { cmd: "docker stop <id>", desc: "Gracefully stops container" },
      { cmd: "docker rm <id>", desc: "Deletes container files metadata" },
      { cmd: "docker compose up", desc: "Launches orchestration services" },
    ],
    sql: [
      { cmd: "SELECT * FROM table_name;", desc: "Queries all table records" },
      { cmd: "INSERT INTO table (col) VALUES (val);", desc: "Appends a new record row" },
      { cmd: "UPDATE table SET col=val WHERE id=1;", desc: "Modifies cell parameters" },
      { cmd: "DELETE FROM table WHERE id=1;", desc: "Deletes rows meeting conditions" },
      { cmd: "ALTER TABLE table ADD col TYPE;", desc: "Appends metadata columns" },
      { cmd: "CREATE TABLE name (id INT PRIMARY KEY);", desc: "Structures database tables" },
    ],
    http: [
      { cmd: "200 OK", desc: "Request resolved successfully" },
      { cmd: "201 Created", desc: "Post request saved database record" },
      { cmd: "400 Bad Request", desc: "API payload parser syntax failed" },
      { cmd: "401 Unauthorized", desc: "Client lacks bearer auth token credentials" },
      { cmd: "403 Forbidden", desc: "User authenticated but lacks page permission role" },
      { cmd: "404 Not Found", desc: "URL route target does not exist" },
      { cmd: "500 Internal Error", desc: "Server script threw compile exceptions" },
      { cmd: "502 Bad Gateway", desc: "Upstream proxy server link failed" },
    ],
  };

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
      
      // Log usage for analytics
      fetch("/api/tools/log-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: `${activeTool}-cheat-sheet` }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = data[activeTool].filter(
    (item) =>
      item.cmd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "markdown", label: "Markdown Syntax" },
          { id: "html", label: "HTML5 Tags" },
          { id: "git", label: "Git Commands" },
          { id: "docker", label: "Docker CLI" },
          { id: "sql", label: "SQL Queries" },
          { id: "http", label: "HTTP Status Codes" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as SheetType);
              setSearchQuery("");
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

      {/* Search filter input */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Filter cheat sheet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 px-3 rounded-lg mono-input text-xs"
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-600" />
      </div>

      {/* Cheat items index list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono group"
          >
            <div className="min-w-0 space-y-1">
              <span className="text-neon-cyan font-bold block select-all truncate">{item.cmd}</span>
              <span className="text-slate-400 block text-[10px] leading-relaxed">{item.desc}</span>
            </div>
            <button
              onClick={() => handleCopy(item.cmd, idx)}
              className="p-2 rounded hover:bg-slate-900 text-slate-500 hover:text-neon-cyan transition-all shrink-0"
              title="Copy snippet"
            >
              {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
