"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "@/utils/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError("");
    setLoading(true);

    try {
      await api.login(username, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError("Incorrect username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse-slow-delayed"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand Logo header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-3 shadow-lg shadow-emerald-500/5 animate-bounce-slow">
            <Leaf size={28} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-100 bg-gradient-to-r from-emerald-400 via-mint-300 to-teal-400 bg-clip-text text-transparent">
            EcoTrackr
          </h2>
          <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1 uppercase">Track. Understand. Reduce.</p>
        </div>

        {/* Floating Glass Card */}
        <div className="glass-card rounded-3xl p-8 border-white/10 shadow-2xl relative">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-zinc-100">Welcome Back</h3>
            <p className="text-xs text-zinc-400 mt-1">Sign in to sync your carbon tracker profile</p>
          </div>

          {error && (
            <div className="p-4 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold tracking-wide uppercase">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full glass-input pl-11 pr-4 py-3.5 text-sm font-sans"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold tracking-wide uppercase">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-11 pr-4 py-3.5 text-sm font-sans"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-extrabold text-sm cursor-pointer transition-all duration-200 transform active:scale-95 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration navigation link */}
          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-white/5 pt-4">
            Don't have an account?{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
              Create one now
            </Link>
          </div>
        </div>

        {/* Bypass login helper for hackathon demo */}
        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-[10px] text-zinc-500 hover:text-zinc-400 transition font-medium tracking-wide uppercase">
            Bypass to Dashboard (Demo Guest Mode)
          </Link>
        </div>
      </div>
    </div>
  );
}
