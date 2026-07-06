"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, Clipboard, Play, Save, Trash2 } from "lucide-react";

type ConfigToolType = "json2toml" | "toml2json" | "json2sql" | "yaml2xml" | "xml2yaml" | "toml2xml" | "xml2toml" | "csv2xml" | "xml2csv";

export default function ConfigConverters({ defaultTool = "json2toml" }: { defaultTool?: ConfigToolType }) {
  const { data: session } = useSession();
  const [activeTool, setActiveTool] = useState<ConfigToolType>(defaultTool);
  const [input, setInput] = useState('{\n  "name": "Hatiyar",\n  "version": 1.2\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const convertConfig = () => {
    setError(null);
    try {
      let res = "";
      switch (activeTool) {
        case "json2toml": {
          const obj = JSON.parse(input);
          res = jsonToToml(obj);
          break;
        }
        case "toml2json": {
          res = JSON.stringify(tomlToJson(input), null, 2);
          break;
        }
        case "json2sql": {
          const obj = JSON.parse(input);
          res = jsonToSqlSchema(obj);
          break;
        }
        case "yaml2xml": {
          const parsedYaml = parseYamlHeuristic(input);
          res = toXmlHeuristic(parsedYaml, "root");
          break;
        }
        case "xml2yaml": {
          const parsedXml = parseXmlHeuristic(input);
          res = toYamlHeuristic(parsedXml);
          break;
        }
        case "toml2xml": {
          const parsedToml = tomlToJson(input);
          res = toXmlHeuristic(parsedToml, "root");
          break;
        }
        case "xml2toml": {
          const parsedXml = parseXmlHeuristic(input);
          res = jsonToToml(parsedXml);
          break;
        }
        case "csv2xml": {
          const rows = parseCsvHeuristic(input);
          res = `<rows>\n` + rows.map(r => `  <row>\n` + Object.entries(r).map(([k, v]) => `    <${k}>${v}</${k}>`).join("\n") + `\n  </row>`).join("\n") + `\n</rows>`;
          break;
        }
        case "xml2csv": {
          const parsedXml = parseXmlHeuristic(input);
          res = xmlToCsvHeuristic(parsedXml);
          break;
        }
      }
      setOutput(res.trim());
    } catch (err: any) {
      setError(err.message || "Failed to execute config data conversion.");
      setOutput("");
    }
  };

  // Heuristic parsers
  const jsonToToml = (obj: any, prefix = ""): string => {
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
      toml += `\n[${fullPath}]\n` + jsonToToml(val, fullPath);
    });
    return toml.trim();
  };

  const tomlToJson = (tomlStr: string): any => {
    const lines = tomlStr.split("\n");
    const result: Record<string, any> = {};
    let currentSection = result;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const sect = trimmed.slice(1, -1).trim();
        result[sect] = {};
        currentSection = result[sect];
      } else if (trimmed.includes("=")) {
        const [k, ...vParts] = trimmed.split("=");
        let valStr = vParts.join("=").trim();
        if (valStr.startsWith('"') && valStr.endsWith('"')) valStr = valStr.slice(1, -1);
        currentSection[k.trim()] = valStr;
      }
    }
    return result;
  };

  const jsonToSqlSchema = (obj: any): string => {
    let sql = "CREATE TABLE users (\n";
    Object.keys(obj).forEach((k) => {
      const val = obj[k];
      let dbType = "VARCHAR(255)";
      if (typeof val === "number") dbType = Number.isInteger(val) ? "INT" : "DECIMAL(10,2)";
      else if (typeof val === "boolean") dbType = "BOOLEAN";
      sql += `  ${k} ${dbType},\n`;
    });
    sql = sql.slice(0, -2) + "\n);";
    return sql;
  };

  const parseYamlHeuristic = (yamlStr: string): any => {
    const lines = yamlStr.split("\n");
    const result: Record<string, any> = {};
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) continue;
      const k = trimmed.substring(0, colonIdx).trim();
      const v = trimmed.substring(colonIdx + 1).trim();
      result[k] = v;
    }
    return result;
  };

  const toXmlHeuristic = (obj: any, rootName = "root", indent = ""): string => {
    let xml = `${indent}<${rootName}>\n`;
    Object.keys(obj).forEach((k) => {
      const val = obj[k];
      if (typeof val === "object" && val !== null) {
        xml += toXmlHeuristic(val, k, indent + "  ") + "\n";
      } else {
        xml += `${indent}  <${k}>${val}</${k}>\n`;
      }
    });
    xml += `${indent}</${rootName}>`;
    return xml;
  };

  const parseXmlHeuristic = (xmlStr: string): any => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, "text/xml");
    const parseNode = (node: any): any => {
      if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
        return node.childNodes[0].nodeValue;
      }
      const obj: Record<string, any> = {};
      for (let child of Array.from(node.childNodes) as any[]) {
        if (child.nodeType !== 1) continue;
        obj[child.nodeName] = parseNode(child);
      }
      return obj;
    };
    return parseNode(doc.documentElement);
  };

  const toYamlHeuristic = (obj: any, indent = ""): string => {
    let yaml = "";
    Object.keys(obj).forEach((k) => {
      const val = obj[k];
      if (typeof val === "object" && val !== null) {
        yaml += `${indent}${k}:\n` + toYamlHeuristic(val, indent + "  ");
      } else {
        yaml += `${indent}${k}: ${val}\n`;
      }
    });
    return yaml;
  };

  const parseCsvHeuristic = (csvStr: string): any[] => {
    const lines = csvStr.split("\n").map(l => l.trim()).filter(l => l !== "");
    if (lines.length === 0) return [];
    const headers = lines[0].split(",");
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",");
      const obj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        obj[h.trim()] = row[idx] ? row[idx].trim() : "";
      });
      result.push(obj);
    }
    return result;
  };

  const xmlToCsvHeuristic = (obj: any): string => {
    const headers = Object.keys(obj);
    const row = headers.map(h => obj[h]);
    return headers.join(",") + "\n" + row.join(",");
  };

  useEffect(() => {
    convertConfig();
  }, [input, activeTool]);

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
      alert("Please sign in to save outputs.");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/tools/save-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: activeTool,
          inputRef: JSON.stringify({ activeTool }),
          outputRef: JSON.stringify({ size: output.length }),
        }),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        fetch("/api/tools/log-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug: activeTool }),
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
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: "json2toml", label: "JSON to TOML" },
          { id: "toml2json", label: "TOML to JSON" },
          { id: "json2sql", label: "JSON to SQL" },
          { id: "yaml2xml", label: "YAML to XML" },
          { id: "xml2yaml", label: "XML to YAML" },
          { id: "toml2xml", label: "TOML to XML" },
          { id: "xml2toml", label: "XML to TOML" },
          { id: "csv2xml", label: "CSV to XML" },
          { id: "xml2csv", label: "XML to CSV" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as ConfigToolType);
              setSaveStatus("idle");
              
              // Set mock placeholder values for ease of testing
              if (t.id.startsWith("json")) setInput('{\n  "id": 1,\n  "name": "Alice"\n}');
              else if (t.id.startsWith("toml")) setInput('[project]\nname = "Hatiyar"\nversion = 1.2');
              else if (t.id.startsWith("yaml")) setInput('name: Hatiyar\nversion: 1.2');
              else if (t.id.startsWith("xml")) setInput('<root>\n  <name>Hatiyar</name>\n  <version>1.2</version>\n</root>');
              else if (t.id.startsWith("csv")) setInput('id,name\n1,Alice\n2,Bob');
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={convertConfig}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/25 transition-all text-xs font-mono"
        >
          Execute Conversion
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

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Input Config Source</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-64 w-full p-4 rounded-xl mono-input text-xs resize-none"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-slate-400 text-xs font-mono uppercase tracking-wider">Converted Target Code</label>
          <textarea
            value={output}
            readOnly
            placeholder="Converted parameters will appear here..."
            className="h-64 w-full p-4 rounded-xl mono-input text-xs resize-none bg-black/60 border-white/5 text-neon-cyan font-mono"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
