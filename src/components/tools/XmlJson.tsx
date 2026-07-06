"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

export default function XmlJson() {
  const { data: session } = useSession();
  const [input, setInput] = useState(`<note>
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const parseXmlNode = (xmlNode: any): any => {
    // If it has no children, return text value
    if (xmlNode.nodeType === 3) return xmlNode.nodeValue; // TEXT_NODE
    if (xmlNode.nodeType === 4) return xmlNode.nodeValue; // CDATA_SECTION_NODE

    if (xmlNode.childNodes.length === 0) return null;
    if (xmlNode.childNodes.length === 1 && (xmlNode.childNodes[0].nodeType === 3 || xmlNode.childNodes[0].nodeType === 4)) {
      return xmlNode.childNodes[0].nodeValue;
    }

    const obj: Record<string, any> = {};
    for (let i = 0; i < xmlNode.childNodes.length; i++) {
      const child = xmlNode.childNodes[i];
      if (child.nodeType !== 1) continue; // Skip comments, white space text nodes

      const childVal = parseXmlNode(child);
      if (obj[child.nodeName] !== undefined) {
        if (!Array.isArray(obj[child.nodeName])) {
          obj[child.nodeName] = [obj[child.nodeName]];
        }
        obj[child.nodeName].push(childVal);
      } else {
        obj[child.nodeName] = childVal;
      }
    }
    return obj;
  };

  const convertXmlToJson = () => {
    if (!input.trim()) return;
    setError(null);
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input.trim(), "text/xml");
      
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        throw new Error(parserError[0].textContent || "XML parsing syntax error.");
      }

      const rootNode = xmlDoc.documentElement;
      const resObj = {
        [rootNode.nodeName]: parseXmlNode(rootNode),
      };

      setOutput(JSON.stringify(resObj, null, 2));
    } catch (err: any) {
      setError(err.message || "Failed to parse XML config.");
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
          toolSlug: "xml-json",
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
          body: JSON.stringify({ toolSlug: "xml-json" }),
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
          onClick={convertXmlToJson}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          <Play className="h-3.5 w-3.5" />
          XML to JSON
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
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">XML Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">JSON Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="JSON config will appear here..."
            className="h-72 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
