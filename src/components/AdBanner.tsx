"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { ExternalLink, Sparkles, Shield, Cpu, Database } from "lucide-react";
import Link from "next/link";

interface AdBannerProps {
  layout: "horizontal" | "vertical";
  slot?: string;
}

interface NativeAd {
  title: string;
  desc: string;
  cta: string;
  url: string;
  tag: string;
  icon: any;
  color: string;
}

const NATIVE_ADS: NativeAd[] = [
  {
    title: "Serverless Postgres",
    desc: "Start free with Neon Database. Instant serverless database branching, autoscaling, and zero cold starts.",
    cta: "Spin up DB",
    url: "https://neon.tech",
    tag: "SPONSOR",
    icon: Database,
    color: "from-green-500/10 to-emerald-500/5 border-green-500/20 text-green-400 hover:border-green-500/40",
  },
  {
    title: "Next.js Git Deployment",
    desc: "Deploy Hatiyar forks and modern React Web Apps globally to Vercel's global edge network in seconds.",
    cta: "Deploy Free",
    url: "https://vercel.com",
    tag: "SPONSOR",
    icon: Cpu,
    color: "from-slate-500/10 to-neutral-500/5 border-neutral-500/20 text-white hover:border-neutral-500/40",
  },
  {
    title: "Authentication Simplified",
    desc: "Integrate sign-ins, user profiles, and multi-tenant security structures into your software stack with Clerk.",
    cta: "Integrate Auth",
    url: "https://clerk.com",
    tag: "SPONSOR",
    icon: Shield,
    color: "from-blue-500/10 to-indigo-500/5 border-blue-500/20 text-indigo-400 hover:border-blue-500/40",
  },
  {
    title: "Unlock Hatiyar Pro",
    desc: "Get unlimited AI-engine checks, resume scoring, priority roasts, and remove all sponsor ads permanently.",
    cta: "Upgrade to Pro",
    url: "/pricing",
    tag: "HATIYAR PRO",
    icon: Sparkles,
    color: "from-neon-violet/10 to-fuchsia-500/5 border-neon-violet/20 text-neon-violet hover:border-neon-violet/40",
  },
];

export default function AdBanner({ layout, slot = "default" }: AdBannerProps) {
  const [adClient, setAdClient] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    // Check if Google AdSense client exists in env variables
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    if (client) {
      setAdClient(client);
      try {
        // Push ad to AdSense array
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense push failed:", err);
      }
    } else {
      // Pick a random mock developer ad
      const randAd = NATIVE_ADS[Math.floor(Math.random() * NATIVE_ADS.length)];
      setSelectedAd(randAd);
    }
  }, []);

  if (adClient) {
    return (
      <div className={`w-full overflow-hidden my-4 bg-white/[0.02] rounded-xl border border-[var(--color-border)] p-2 flex justify-center items-center ${
        layout === "vertical" ? "min-h-[250px]" : "min-h-[90px]"
      }`}>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={adClient}
          data-ad-slot={slot}
          data-ad-format={layout === "vertical" ? "vertical" : "horizontal"}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  if (!selectedAd) return null;

  const IconComp = selectedAd.icon;

  if (layout === "vertical") {
    return (
      <div className={`surface rounded-xl border p-5 relative overflow-hidden transition-all duration-300 space-y-4 ${selectedAd.color}`}>
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-white/5 border-l border-b border-white/10 text-[var(--color-fg-subtle)] text-[8px] font-mono font-bold uppercase rounded-bl">
          {selectedAd.tag}
        </div>
        <div className="h-9 w-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
          <IconComp className="h-4.5 w-4.5" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-white">{selectedAd.title}</h4>
          <p className="text-[10px] text-[var(--color-fg-muted)] leading-relaxed">
            {selectedAd.desc}
          </p>
        </div>
        {selectedAd.url.startsWith("http") ? (
          <a
            href={selectedAd.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm w-full"
          >
            {selectedAd.cta}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <Link
            href={selectedAd.url}
            className="btn btn-ghost btn-sm w-full"
          >
            {selectedAd.cta}
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    );
  }

  // Horizontal Banner Layout
  return (
    <div className={`surface rounded-xl border p-4 relative overflow-hidden transition-all duration-300 ${selectedAd.color}`}>
      <div className="absolute top-0 right-0 px-2 py-0.5 bg-white/5 border-l border-b border-white/10 text-[var(--color-fg-subtle)] text-[8px] font-mono font-bold uppercase rounded-bl">
        {selectedAd.tag}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
            <IconComp className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white">{selectedAd.title}</h4>
            <p className="text-[10px] text-[var(--color-fg-muted)] max-w-xl leading-normal">
              {selectedAd.desc}
            </p>
          </div>
        </div>
        {selectedAd.url.startsWith("http") ? (
          <a
            href={selectedAd.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm shrink-0"
          >
            {selectedAd.cta}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <Link
            href={selectedAd.url}
            className="btn btn-ghost btn-sm shrink-0"
          >
            {selectedAd.cta}
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
