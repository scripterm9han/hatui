"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Sparkles, Mail, Terminal, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState(false);
  const [devEmail, setDevEmail] = useState("developer@hatiyar.in");
  const [devName, setDevName] = useState("Lead Developer");
  const [devPlan, setDevPlan] = useState("free");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading("email");
    try {
      const res = await signIn("email", { email, callbackUrl, redirect: false });
      if (res?.error) {
        alert("Failed to send magic link: " + res.error);
      } else {
        setSentMessage(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading("google");
    signIn("google", { callbackUrl });
  };

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("dev");
    try {
      const res = await signIn("credentials", {
        email: devEmail,
        name: devName,
        plan: devPlan,
        redirect: false,
      });
      if (res?.error) {
        alert("Developer login failed: " + res.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark grid-bg flex flex-col items-center justify-center p-4 relative">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-neon-cyan/5 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl border border-border-card p-8 z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Shield className="h-6 w-6 text-neon-cyan" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            Sign In to <span className="text-neon-cyan font-mono">Hatiyar</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Access pro features, AI tools, and save your output history.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs text-center">
            {error === "OAuthSignin" || error === "OAuthCallback"
              ? "Error linking your Google account. Please try again."
              : "Authentication failed. Please verify credentials."}
          </div>
        )}

        {sentMessage ? (
          <div className="p-4 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 text-center">
            <Mail className="h-10 w-10 text-neon-cyan mx-auto mb-3 animate-pulse" />
            <h3 className="text-white font-semibold text-lg">Check your email</h3>
            <p className="text-slate-400 text-sm mt-1">
              We sent a magic link to <strong className="text-white">{email}</strong>. Click the link in your inbox to sign in instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Google Login */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white text-black hover:bg-slate-200 transition-colors font-medium text-sm disabled:opacity-50"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              {loading === "google" ? "Connecting..." : "Continue with Google"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider font-mono">or</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Email Magic Link */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-slate-400 text-xs font-mono mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl mono-input text-sm"
                  disabled={loading !== null}
                />
              </div>

              <button
                type="submit"
                disabled={loading !== null || !email}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20 transition-all font-medium text-sm disabled:opacity-50 font-mono shadow-[0_0_15px_rgba(0,240,255,0.05)]"
              >
                {loading === "email" ? "Sending..." : "Send Magic Link"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Collapsible Developer Console */}
            <div className="border-t border-slate-800/80 pt-6">
              <details className="group">
                <summary className="list-none flex items-center justify-between cursor-pointer text-xs font-mono text-slate-500 hover:text-neon-cyan transition-colors select-none">
                  <span className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5" />
                    DEVELOPER MOCK CONSOLE (LOCAL TEST)
                  </span>
                  <span className="transition-transform group-open:rotate-180 text-[10px] font-sans">▼</span>
                </summary>
                
                <form onSubmit={handleDevSignIn} className="mt-4 p-4 rounded-xl border border-slate-800 bg-bg-darker/60 space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase">Test Name</label>
                    <input
                      type="text"
                      value={devName}
                      onChange={(e) => setDevName(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg mono-input text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase">Test Email</label>
                    <input
                      type="email"
                      value={devEmail}
                      onChange={(e) => setDevEmail(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg mono-input text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase">Mock Plan Tier</label>
                    <select
                      value={devPlan}
                      onChange={(e) => setDevPlan(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg mono-input text-xs bg-black text-white"
                    >
                      <option value="free">Free Plan (Rate Limited)</option>
                      <option value="pro">Pro Plan (Unlimited Access)</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading !== null}
                    className="w-full h-8 rounded-lg bg-neon-cyan hover:bg-neon-cyan/80 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 font-mono shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Bypass Login & Continue
                  </button>
                </form>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
