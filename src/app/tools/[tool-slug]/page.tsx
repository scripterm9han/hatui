import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { toolsList } from "@/lib/tools-data";
import Link from "next/link";
import { Zap, ShieldCheck, ArrowRight, BookOpen, Binary, Braces, RefreshCw, QrCode, FileCheck, Flame } from "lucide-react";

import JsonFormatter from "@/components/tools/JsonFormatter";
import RegexTester from "@/components/tools/RegexTester";
import UnitConverter from "@/components/tools/UnitConverter";
import QrGenerator from "@/components/tools/QrGenerator";
import ResumeChecker from "@/components/tools/ResumeChecker";
import ResumeRoaster from "@/components/tools/ResumeRoaster";
import Base64Converter from "@/components/tools/Base64Converter";
import UrlEncoder from "@/components/tools/UrlEncoder";
import HtmlEncoder from "@/components/tools/HtmlEncoder";
import HashGenerator from "@/components/tools/HashGenerator";
import UuidGenerator from "@/components/tools/UuidGenerator";
import MarkdownPreviewer from "@/components/tools/MarkdownPreviewer";
import JwtDecoder from "@/components/tools/JwtDecoder";
import SqlFormatter from "@/components/tools/SqlFormatter";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import LoremIpsum from "@/components/tools/LoremIpsum";
import HexRgbConverter from "@/components/tools/HexRgbConverter";
import CssGradient from "@/components/tools/CssGradient";
import DiffChecker from "@/components/tools/DiffChecker";
import XmlFormatter from "@/components/tools/XmlFormatter";
import JsonYaml from "@/components/tools/JsonYaml";
import YamlJson from "@/components/tools/YamlJson";
import CaseConverter from "@/components/tools/CaseConverter";
import TimestampConverter from "@/components/tools/TimestampConverter";
import WordCounter from "@/components/tools/WordCounter";
import Base32Converter from "@/components/tools/Base32Converter";
import UrlParser from "@/components/tools/UrlParser";
import UserAgent from "@/components/tools/UserAgent";
import BaseConverter from "@/components/tools/BaseConverter";
import MorseTranslator from "@/components/tools/MorseTranslator";
import JsonCsv from "@/components/tools/JsonCsv";
import StringUtility from "@/components/tools/StringUtility";
import PlaceholderImage from "@/components/tools/PlaceholderImage";
import RegexCheatSheet from "@/components/tools/RegexCheatSheet";
import HtmlPreview from "@/components/tools/HtmlPreview";
import JsonToTs from "@/components/tools/JsonToTs";
import CronParser from "@/components/tools/CronParser";
import CurlToFetch from "@/components/tools/CurlToFetch";
import SlugGenerator from "@/components/tools/SlugGenerator";
import HtmlToMarkdown from "@/components/tools/HtmlToMarkdown";
import JwtGenerator from "@/components/tools/JwtGenerator";
import BoxShadow from "@/components/tools/BoxShadow";
import JsonXml from "@/components/tools/JsonXml";
import XmlJson from "@/components/tools/XmlJson";
import HexEncoder from "@/components/tools/HexEncoder";
import LineSorter from "@/components/tools/LineSorter";
import YamlToml from "@/components/tools/YamlToml";
import TomlYaml from "@/components/tools/TomlYaml";
import Base64Image from "@/components/tools/Base64Image";
import ContrastChecker from "@/components/tools/ContrastChecker";
import NumberWords from "@/components/tools/NumberWords";
import BcryptTester from "@/components/tools/BcryptTester";
import ScreenSize from "@/components/tools/ScreenSize";
import LoremCode from "@/components/tools/LoremCode";
import Base64Size from "@/components/tools/Base64Size";
import LoremLists from "@/components/tools/LoremLists";

import NetworkUtils from "@/components/tools/NetworkUtils";
import CssGenerators from "@/components/tools/CssGenerators";
import MathSolvers from "@/components/tools/MathSolvers";
import ConfigConverters from "@/components/tools/ConfigConverters";
import StringEncoders from "@/components/tools/StringEncoders";
import MiscUtils from "@/components/tools/MiscUtils";
import AdBanner from "@/components/AdBanner";

interface PageProps {
  params: Promise<{ "tool-slug": string }>;
}

const iconMap: Record<string, any> = {
  Binary: Binary,
  Braces: Braces,
  RefreshCw: RefreshCw,
  QrCode: QrCode,
  FileCheck: FileCheck,
  Flame: Flame,
};

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams["tool-slug"];
  const tool = toolsList.find((t) => t.slug === slug);

  if (!tool) {
    return {
      title: "Tool Not Found - Hatiyar",
    };
  }

  return {
    title: `${tool.name} - Free Online Developer Tool | Hatiyar`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} | Hatiyar Multi-Tool Platform`,
      description: tool.description,
      type: "website",
      url: `https://hatiyar.in/tools/${tool.slug}`,
      images: [
        {
          url: `https://hatiyar.in/api/og?title=${encodeURIComponent(tool.name)}&description=${encodeURIComponent(tool.description)}`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.name,
      description: tool.description,
    },
  };
}

// 2. Dynamic Tool Routing Page
export default async function ToolPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams["tool-slug"];
  const tool = toolsList.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  // 3. Resolve user plan server-side for ad gating
  const session = await getServerSession(authOptions);
  const userPlan = session?.user ? (session.user as any).plan : "free";

  // Map slugs to components
  const renderToolComponent = () => {
    switch (tool.slug) {
      case "json-formatter":
        return <JsonFormatter />;
      case "regex-tester":
        return <RegexTester />;
      case "unit-converter":
        return <UnitConverter />;
      case "qr-generator":
        return <QrGenerator />;
      case "resume-checker":
        return <ResumeChecker />;
      case "resume-roaster":
        return <ResumeRoaster />;
      case "base64-converter":
        return <Base64Converter />;
      case "url-encoder":
        return <UrlEncoder />;
      case "html-encoder":
        return <HtmlEncoder />;
      case "hash-generator":
        return <HashGenerator />;
      case "uuid-generator":
        return <UuidGenerator />;
      case "markdown-previewer":
        return <MarkdownPreviewer />;
      case "jwt-decoder":
        return <JwtDecoder />;
      case "sql-formatter":
        return <SqlFormatter />;
      case "password-generator":
        return <PasswordGenerator />;
      case "lorem-ipsum":
        return <LoremIpsum />;
      case "hex-rgb-converter":
        return <HexRgbConverter />;
      case "css-gradient":
        return <CssGradient />;
      case "diff-checker":
        return <DiffChecker />;
      case "xml-formatter":
        return <XmlFormatter />;
      case "json-yaml":
        return <JsonYaml />;
      case "yaml-json":
        return <YamlJson />;
      case "case-converter":
        return <CaseConverter />;
      case "timestamp-converter":
        return <TimestampConverter />;
      case "word-counter":
        return <WordCounter />;
      case "base32-converter":
        return <Base32Converter />;
      case "url-parser":
        return <UrlParser />;
      case "user-agent":
        return <UserAgent />;
      case "base-converter":
        return <BaseConverter />;
      case "morse-translator":
        return <MorseTranslator />;
      case "json-csv":
        return <JsonCsv />;
      case "string-utility":
        return <StringUtility />;
      case "placeholder-image":
        return <PlaceholderImage />;
      case "regex-cheat-sheet":
        return <RegexCheatSheet />;
      case "html-preview":
        return <HtmlPreview />;
      case "json-to-ts":
        return <JsonToTs />;
      case "cron-parser":
        return <CronParser />;
      case "curl-to-fetch":
        return <CurlToFetch />;
      case "slug-generator":
        return <SlugGenerator />;
      case "html-to-markdown":
        return <HtmlToMarkdown />;
      case "jwt-generator":
        return <JwtGenerator />;
      case "box-shadow":
        return <BoxShadow />;
      case "json-xml":
        return <JsonXml />;
      case "xml-json":
        return <XmlJson />;
      case "hex-encoder":
        return <HexEncoder />;
      case "line-sorter":
        return <LineSorter />;
      case "yaml-toml":
        return <YamlToml />;
      case "toml-yaml":
        return <TomlYaml />;
      case "base64-image":
        return <Base64Image />;
      case "contrast-checker":
        return <ContrastChecker />;
      case "number-words":
        return <NumberWords />;
      case "bcrypt-tester":
        return <BcryptTester />;
      case "screen-size":
        return <ScreenSize />;
      case "lorem-code":
        return <LoremCode />;
      case "base64-size":
        return <Base64Size />;
      case "lorem-lists":
        return <LoremLists />;
      case "subnet-calculator":
        return <NetworkUtils defaultTool="subnet" />;
      case "dns-lookup":
        return <NetworkUtils defaultTool="dns" />;
      case "ping-test":
        return <NetworkUtils defaultTool="ping" />;
      case "border-radius-generator":
        return <CssGenerators defaultTool="border-radius" />;
      case "glassmorphism-generator":
        return <CssGenerators defaultTool="glassmorphism" />;
      case "prime-checker":
        return <MathSolvers defaultTool="prime" />;
      case "fibonacci-generator":
        return <MathSolvers defaultTool="fibonacci" />;
      case "json-to-toml":
        return <ConfigConverters defaultTool="json2toml" />;
      case "toml-to-json":
        return <ConfigConverters defaultTool="toml2json" />;
      case "caesar-cipher":
        return <StringEncoders defaultTool="caesar" />;
      default:
        notFound();
    }
  };

  // Get other tools for the sidebar index
  const otherTools = toolsList.filter((t) => t.slug !== tool.slug).slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="shell space-y-8">
        {/* Tool Header Title & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {tool.name}
            </h1>
            {tool.isAi && (
              <span className="chip chip-violet">AI Engine</span>
            )}
            <span className="chip">{tool.category}</span>
          </div>
          <p className="text-[var(--color-fg-muted)] text-sm max-w-2xl leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Dynamic Two-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Left Column: Tool Container & FAQs */}
          <div className="space-y-6">
            <div className="surface rounded-2xl p-6 md:p-8">
              {renderToolComponent()}
            </div>

            {/* Detailed SEO Instructions */}
            <div className="surface rounded-2xl p-8 space-y-6">
              <h3 className="text-sm font-bold text-white border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-[var(--color-accent)]" />
                Documentation &amp; Usage Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[var(--color-fg-muted)] leading-relaxed">
                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">What is this tool?</h4>
                  <p>
                    The {tool.name} is a high-performance utility designed to streamline developer workflows.
                    Built to operate entirely {tool.isAi ? "with advanced server-side AI processing" : "client-side inside your browser for zero latency"},
                    it ensures maximum security and quick response times.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">How do I use it?</h4>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Input parameters in the editor or upload file fields.</li>
                    <li>Adjust formatting options, sizes, or matching triggers.</li>
                    <li>Copy output values, download results, or save output to your history log.</li>
                  </ol>
                </div>
              </div>
            </div>
            {userPlan !== "pro" && (
              <AdBanner layout="horizontal" />
            )}
          </div>

          {/* Right Column: Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">

            {/* Gated Sponsor Ad Card (Free users only) */}
            {userPlan !== "pro" ? (
              <div className="surface-accent rounded-xl p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-[var(--color-accent)] text-white text-[8px] font-mono font-bold uppercase rounded-bl">
                  Sponsor
                </div>
                <span className="block text-[9px] font-mono text-[var(--color-fg-subtle)] uppercase tracking-wider">Sponsored Promotion</span>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    Unlock Unlimited AI Checks
                  </h4>
                  <p className="text-[11px] text-[var(--color-fg-muted)] leading-relaxed">
                    Tired of daily limits? Hatiyar Pro offers unlimited Resume Checks, Roasts, and saves. Remove all ads.
                  </p>
                </div>

                <Link
                  href="/pricing"
                  className="btn btn-primary btn-sm w-full"
                >
                  Upgrade to Pro • ₹299
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="surface rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
                  Pro Status Active
                </h4>
                <p className="text-[11px] text-[var(--color-fg-muted)] leading-relaxed">
                  Thanks for supporting Hatiyar! All daily rate limits are removed, and sponsor ads are disabled.
                </p>
              </div>
            )}

            {userPlan !== "pro" && (
              <AdBanner layout="vertical" />
            )}

            {/* Quick Tools Navigation Index */}
            <div className="surface rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white font-mono">Popular Tools</h4>
              <div className="space-y-1.5">
                {otherTools.map((t) => {
                  const IconComp = iconMap[t.icon] || Binary;
                  return (
                    <Link
                      key={t.slug}
                      href={`/tools/${t.slug}`}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-all text-sm"
                    >
                      <IconComp className="h-4 w-4 shrink-0" />
                      <span className="truncate font-medium">{t.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Active Systems Status */}
            <div className="surface rounded-xl p-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-fg-subtle)]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                Systems Operational
              </span>
              <span>Uptime: 99.98%</span>
            </div>

          </aside>
        </div>

      </div>
    </div>
  );
}

// 4. Generate static paths for all 56 tools for fast loading (SSG)
export async function generateStaticParams() {
  return toolsList.map((t) => ({
    "tool-slug": t.slug,
  }));
}
export const dynamic = "force-dynamic";
