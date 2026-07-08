"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Binary, Braces, RefreshCw, QrCode, FileCheck, Flame, Cpu, LucideIcon } from "lucide-react";
import { Tool } from "@/lib/tools-data";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

const iconMap: Record<string, LucideIcon> = {
  Binary: Binary,
  Braces: Braces,
  RefreshCw: RefreshCw,
  QrCode: QrCode,
  FileCheck: FileCheck,
  Flame: Flame,
};

// Helper to convert HSL to RGB string for inline CSS box shadows
const hslToRgbString = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return `${r}, ${g}, ${b}`;
};

// Define explicit styles for all cards based on tool icon
interface StyleConfig {
  glowOverlay: string;
  iconBoxClass: string;
  iconClass: string;
  badgeClass: string;
  dotClass: string;
  btnClass: string;
}

const getCardStyle = (icon: string, slug: string, index: number, glowRgb: string, colorName: string): StyleConfig => {
  return {
    glowOverlay: `rgba(${glowRgb}, 0.04)`,
    iconBoxClass: `bg-${colorName}-500/10 border-${colorName}-500/30`,
    iconClass: `text-${colorName}-400`,
    badgeClass: `bg-${colorName}-500/10 border-${colorName}-500/20 text-${colorName}-400`,
    dotClass: `bg-${colorName}`,
    btnClass: `bg-gradient-to-r from-${colorName}-600 to-${colorName}-500 shadow-[0_0_15px_rgba(${glowRgb},0.2)]`,
  };
};

const getUniqueWatermark = (slug: string, isHovered: boolean): React.ReactNode => {
  const normSlug = slug.toLowerCase();
  
  if (normSlug === "json-formatter") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ maskImage: 'radial-gradient(circle, black, transparent)', WebkitMaskImage: 'radial-gradient(circle, black, transparent)' }}>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-5xl font-extrabold animate-pulse" style={{ animationDuration: '4s' }}>
          {"{}"}
        </div>
        <div className="absolute left-2 top-0 text-[8px] font-mono leading-tight flex flex-col space-y-1.5 animate-scroll-up opacity-70">
          <div>{"{ status: 200 }"}</div>
          <div>{"[data: array]"}</div>
          <div>{"(cache: hit)"}</div>
          <div>{"{ id: 4501 }"}</div>
          <div>{"{ type: 'json' }"}</div>
          <div>{"{ status: 200 }"}</div>
          <div>{"[data: array]"}</div>
          <div>{"(cache: hit)"}</div>
          <div>{"{ id: 4501 }"}</div>
          <div>{"{ type: 'json' }"}</div>
        </div>
      </div>
    );
  }

  if (normSlug === "regex-tester") {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.25">
        <path d="M10,75 Q30,35 50,55 T90,15" strokeDasharray="6,6" className="animate-dash" />
        <circle cx="10" cy="75" r="3.5" fill="currentColor" className="animate-pulse" style={{ animationDuration: '2s' }} />
        <circle cx="38" cy="45" r="3.5" fill="currentColor" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
        <circle cx="50" cy="55" r="3.5" fill="currentColor" className="animate-pulse" style={{ animationDuration: '1.8s' }} />
        <circle cx="90" cy="15" r="3.5" fill="currentColor" className="animate-pulse" style={{ animationDuration: '3s' }} />
      </svg>
    );
  }

  if (normSlug === "unit-converter") {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
        <text x="25" y="40" fontSize="24" style={{ animation: "float-slowly 6s infinite ease-in-out" }}>$</text>
        <text x="75" y="48" fontSize="30" style={{ animation: "float-slowly 8s infinite ease-in-out", animationDelay: "1.5s" }}>€</text>
        <text x="45" y="80" fontSize="22" style={{ animation: "float-slowly 5s infinite ease-in-out", animationDelay: "0.7s" }}>£</text>
        <text x="15" y="75" fontSize="16" style={{ animation: "float-slowly 7s infinite ease-in-out", animationDelay: "2.2s" }}>¥</text>
      </svg>
    );
  }

  if (normSlug === "qr-generator") {
    return (
      <div className="w-full h-full relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.25">
          <rect x="15" y="15" width="30" height="30" rx="2" />
          <rect x="22" y="22" width="16" height="16" />
          <rect x="55" y="15" width="30" height="30" rx="2" />
          <rect x="62" y="22" width="16" height="16" />
          <rect x="15" y="55" width="30" height="30" rx="2" />
          <rect x="22" y="62" width="16" height="16" />
          <rect x="65" y="65" width="12" height="12" fill="currentColor" />
        </svg>
        <div 
          className="absolute left-[10%] w-[80%] h-0.5 bg-current"
          style={{
            boxShadow: "0 0 8px 1.5px currentColor",
            animation: "scan-line 3s infinite linear"
          }}
        />
      </div>
    );
  }

  if (normSlug === "resume-checker") {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.25">
        <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" opacity="0.15" />
        <circle 
          cx="50" 
          cy="50" 
          r="38" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="240" 
          strokeDashoffset="240" 
          strokeLinecap="round"
          style={{
            animation: "draw-circle 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            transformOrigin: "50% 50%",
            transform: "rotate(-90deg)"
          }}
        />
        <text 
          x="50" 
          y="55" 
          fontSize="22" 
          fontWeight="bold" 
          textAnchor="middle" 
          fill="currentColor"
          style={{ animation: "pulse-scale 3s infinite ease-in-out" }}
        >
          85
        </text>
        <text x="50" y="68" fontSize="8" textAnchor="middle" fill="currentColor" opacity="0.8">ATS SCORE</text>
      </svg>
    );
  }

  if (normSlug === "resume-roaster") {
    return (
      <svg 
        className="w-full h-full" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1"
        style={{ animation: "flame-flicker 3s infinite ease-in-out" }}
      >
        <path d="M30,30 Q40,15 45,35 Q50,40 55,35 Q60,15 70,30 C75,55 75,70 50,75 C25,70 25,55 30,30 Z" />
        <circle cx="42" cy="48" r="2.5" fill="currentColor" />
        <circle cx="58" cy="48" r="2.5" fill="currentColor" />
        <path d="M45,60 Q50,55 55,60" />
      </svg>
    );
  }

  // Security, UUIDs, Passwords, Cryptography
  if (normSlug.includes("password") || normSlug.includes("uuid") || normSlug.includes("hash") || normSlug.includes("secure") || normSlug.includes("crypto")) {
    return (
      <div className="w-full h-full relative" style={{ maskImage: 'radial-gradient(circle, black, transparent)', WebkitMaskImage: 'radial-gradient(circle, black, transparent)' }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" style={{ animation: "float-slowly 5s infinite ease-in-out" }}>
          <rect x="35" y="45" width="30" height="25" rx="3" />
          <path d="M42,45 V35 A8,8 0 0,1 58,35 V45" />
          <circle cx="50" cy="55" r="3" fill="currentColor" />
        </svg>
        <div className="absolute right-0 top-2 text-[7px] font-mono leading-none opacity-60 flex flex-col space-y-1 animate-scroll-up" style={{ animationDuration: '10s' }}>
          <div>SHA-256</div>
          <div>550e8400</div>
          <div>f81d-4030</div>
          <div>9a21-4562</div>
          <div>e3b8-6872</div>
          <div>SHA-256</div>
          <div>550e8400</div>
          <div>f81d-4030</div>
        </div>
      </div>
    );
  }

  // Database, SQL, Tabular
  if (normSlug.includes("sql") || normSlug.includes("db") || normSlug.includes("table") || normSlug.includes("data")) {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.25" style={{ animation: "float-slowly 6s infinite ease-in-out" }}>
        <path d="M30,30 C30,25 70,25 70,30 C70,35 30,35 30,30 Z" />
        <path d="M30,30 V45 C30,50 70,50 70,45 V30" />
        <path d="M30,45 V60 C30,65 70,65 70,60 V45" />
        <path d="M30,60 V75 C30,80 70,80 70,75 V60" />
        <circle cx="50" cy="30" r="2" fill="currentColor" className="animate-pulse" />
      </svg>
    );
  }

  // Conversions, Encoders, Decoders (URL, Base64, HTML, Hex)
  if (normSlug.includes("encode") || normSlug.includes("decode") || normSlug.includes("convert") || normSlug.includes("parser") || normSlug.includes("jwt")) {
    return (
      <div className="w-full h-full relative" style={{ maskImage: 'radial-gradient(circle, black, transparent)', WebkitMaskImage: 'radial-gradient(circle, black, transparent)' }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" style={{ animation: "float-slowly 7s infinite ease-in-out" }}>
          <path d="M30,50 C30,35 70,35 70,50 C70,65 30,65 30,50" />
          <polygon points="70,45 75,52 67,52" fill="currentColor" />
          <polygon points="30,55 25,48 33,48" fill="currentColor" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] opacity-75 font-semibold text-center leading-none">
          <div className="animate-pulse" style={{ animationDuration: '3.5s' }}>
            <div>UTF-8</div>
            <div className="my-1">⇄</div>
            <div>B64 / URL</div>
          </div>
        </div>
      </div>
    );
  }

  // Text, Lorem Ipsum, Markdown, Previews
  if (normSlug.includes("markdown") || normSlug.includes("lorem") || normSlug.includes("text") || normSlug.includes("preview") || normSlug.includes("previewer")) {
    return (
      <div className="w-full h-full relative font-serif text-3xl font-bold flex items-center justify-center" style={{ maskImage: 'radial-gradient(circle, black, transparent)', WebkitMaskImage: 'radial-gradient(circle, black, transparent)' }}>
        <div className="animate-float" style={{ animation: "float-slowly 6s infinite ease-in-out" }}>
          ¶
        </div>
        <div className="absolute left-2 top-2 font-mono text-[8px] opacity-50 flex flex-col space-y-1">
          <div># Header</div>
          <div>**bold**</div>
          <div>*italic*</div>
          <div>&gt; quote</div>
        </div>
      </div>
    );
  }

  // Maths, calculators
  if (normSlug.includes("math") || normSlug.includes("calc") || normSlug.includes("solve") || normSlug.includes("number")) {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor" style={{ animation: "float-slowly 6s infinite ease-in-out" }}>
        <text x="25" y="35" fontSize="24">+</text>
        <text x="75" y="42" fontSize="26">÷</text>
        <text x="48" y="75" fontSize="28">×</text>
        <text x="18" y="75" fontSize="22">−</text>
      </svg>
    );
  }

  // Abstract Concentric Dashed Rings - custom computed per card using character offsets!
  const slugLen = slug.length;
  const ringsCount = (slugLen % 3) + 2; // 2 to 4 rings
  const dashCount = ((slugLen * 3) % 15) + 5; // 5 to 20 dashes
  const speed = ((slugLen * 1.5) % 12) + 6; // 6 to 18 seconds rotation
  const alternate = slugLen % 2 === 0;

  return (
    <svg 
      className="w-full h-full" 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="0.75"
      style={{ 
        animation: `spin-slowly ${speed}s infinite linear ${alternate ? "reverse" : "normal"}` 
      }}
    >
      {Array.from({ length: ringsCount }).map((_, rIdx) => {
        const radius = 18 + rIdx * 10;
        const offset = (rIdx * 15) % 360;
        return (
          <circle 
            key={rIdx}
            cx="50" 
            cy="50" 
            r={radius} 
            strokeDasharray={`${dashCount} ${dashCount * 1.5}`}
            strokeDashoffset={offset}
            opacity={0.25 + (rIdx * 0.15)}
          />
        );
      })}
      <circle cx="50" cy="50" r="3" fill="currentColor" className="animate-pulse" />
    </svg>
  );
};

export default function ToolCard({ tool, index }: ToolCardProps) {
  const IconComp = iconMap[tool.icon] || Cpu;

  // 1. Calculate a completely unique color spectrum per tool using the Golden Ratio Hue Spacing!
  // This guarantees that Card 1, Card 2, Card 3, etc., all have different visual colors.
  const hue = (index * 137.5) % 360;
  const glowRgb = hslToRgbString(hue, 100, 50);

  // Derive a valid text and bg color name dynamically
  const colorNames = ["emerald", "purple", "blue", "amber", "cyan", "rose", "lime", "indigo", "violet", "pink", "orange", "teal"];
  const colorName = colorNames[index % colorNames.length];

  const style = getCardStyle(tool.icon, tool.slug, index, glowRgb, colorName);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic inline styling for glows matching the user's gorgeous image cards
  const cardStyle = {
    boxShadow: isHovered
      ? `0 0 35px rgba(${glowRgb}, 0.38), inset 0 0 16px rgba(${glowRgb}, 0.15), 0 10px 40px rgba(0, 0, 0, 0.7)`
      : `0 0 20px -6px rgba(${glowRgb}, 0.14), inset 0 0 10px rgba(${glowRgb}, 0.06), 0 4px 30px rgba(0, 0, 0, 0.4)`,
    borderColor: isHovered ? `rgba(${glowRgb}, 0.65)` : `rgba(${glowRgb}, 0.22)`,
    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
  };

  const iconStyle = {
    boxShadow: isHovered ? `0 0 20px rgba(${glowRgb}, 0.35)` : "none",
  };

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="relative h-[250px] rounded-2xl border bg-black/45 backdrop-blur-md p-6 flex flex-col justify-between group transition-all duration-300 overflow-hidden"
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Light leak behind top-left icon (Gives the beautiful glowing visual in your image) */}
      <div 
        className="absolute pointer-events-none -z-10 rounded-full blur-[45px] transition-all duration-500"
        style={{
          top: "-20px",
          left: "-20px",
          width: "150px",
          height: "150px",
          background: `radial-gradient(circle, rgba(${glowRgb}, ${isHovered ? 0.25 : 0.12}) 0%, rgba(${glowRgb}, 0) 70%)`
        }}
      />

      {/* Light leak at the bottom right under button */}
      <div 
        className="absolute pointer-events-none -z-10 rounded-full blur-[35px] transition-all duration-500"
        style={{
          bottom: "-20px",
          right: "-20px",
          width: "110px",
          height: "110px",
          background: `radial-gradient(circle, rgba(${glowRgb}, ${isHovered ? 0.2 : 0.08}) 0%, rgba(${glowRgb}, 0) 70%)`
        }}
      />

      {/* Background glow overlay on hover */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{
          background: `radial-gradient(180px circle at 50% 0%, ${style.glowOverlay}, transparent 70%)`
        }}
      />

      {/* Styled background watermark illustration with glowing filter, properly aligned and sized */}
      <div 
        className="absolute right-4 top-[48%] -translate-y-1/2 w-28 h-28 pointer-events-none select-none z-0 flex items-center justify-center transition-all duration-300"
        style={{
          filter: `drop-shadow(0 0 12px rgba(${glowRgb}, ${isHovered ? 0.7 : 0.35}))`,
          opacity: isHovered ? 0.85 : 0.5,
          color: `rgba(${glowRgb}, 1)`, // Use the exact dynamic neon color for the watermark paths!
        }}
      >
        {getUniqueWatermark(tool.slug, isHovered)}
      </div>

      {/* Content wrapper - limited to 65% width to avoid overlapping watermarks */}
      <div className="space-y-4 relative z-10 max-w-[65%] pr-2">
        <div className="flex items-center justify-between">
          {/* Glowing icon wrapper */}
          <div 
            className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all duration-300 ${style.iconBoxClass} group-hover:scale-105`}
            style={iconStyle}
          >
            <IconComp className={`h-5 w-5 ${style.iconClass}`} />
          </div>

          {/* Uses metrics badge */}
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badgeClass}`}>
            ⚡ {tool.monthlyUses || "10K"} uses
          </span>
        </div>

        {/* Text descriptions */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white group-hover:text-white transition-colors flex items-center gap-2">
            {tool.name}
            {tool.isAi && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-400 uppercase tracking-wider">
                AI
              </span>
            )}
          </h3>
          <p className="text-[var(--color-fg-muted)] text-xs leading-relaxed line-clamp-3 group-hover:text-white/80 transition-colors">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-auto relative z-10">
        <span className="text-[10px] font-mono text-[var(--color-fg-subtle)] uppercase tracking-wider flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dotClass}`} />
          {tool.category.replace(" Utilities", "").replace(" Tools", "")}
        </span>
        
        {/* Dynamic Launch button */}
        <span className={`inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-white px-3.5 py-1.5 rounded-full transition-all duration-300 ${style.btnClass} group-hover:scale-105 group-hover:brightness-110`}>
          Launch
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
