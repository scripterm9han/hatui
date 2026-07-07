"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Mail, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState(false);

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


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-md surface rounded-2xl p-8 z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl btn-accent-soft flex items-center justify-center mb-3">
            <Shield className="h-6 w-6 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Sign In to <span className="text-[var(--color-accent)] font-mono">Hatiyar</span>
          </h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-1.5">
            Access pro features, AI tools, and save your output history.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-xs text-center">
            {error === "OAuthSignin" || error === "OAuthCallback"
              ? "Error linking your Google account. Please try again."
              : "Authentication failed. Please verify credentials."}
          </div>
        )}

        {sentMessage ? (
          <div className="p-4 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] text-center">
            <Mail className="h-10 w-10 text-[var(--color-accent)] mx-auto mb-3 animate-pulse" />
            <h3 className="text-white font-semibold text-lg">Check your email</h3>
            <p className="text-[var(--color-fg-muted)] text-sm mt-1.5">
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
              <div className="flex-grow border-t border-[var(--color-border)]"></div>
              <span className="flex-shrink mx-4 text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider font-mono">or</span>
              <div className="flex-grow border-t border-[var(--color-border)]"></div>
            </div>

            {/* Email Magic Link */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[var(--color-fg-muted)] text-xs font-mono mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field h-11 px-4 text-sm"
                  disabled={loading !== null}
                />
              </div>

              <button
                type="submit"
                disabled={loading !== null || !email}
                className="btn btn-accent-soft btn-md w-full disabled:opacity-50"
              >
                {loading === "email" ? "Sending..." : "Send Magic Link"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
