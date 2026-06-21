"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "@/utils/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.register(username, password);
      setSuccess(true);
      // Auto login
      setTimeout(async () => {
        try {
          await api.login(username, password);
          router.push("/dashboard");
          router.refresh();
        } catch (err) {
          router.push("/login");
        }
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError("Username already exists or registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse-slow-delayed"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-3 shadow-lg shadow-emerald-500/5 animate-bounce-slow">
            <Leaf size={28} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-100 bg-gradient-to-r from-emerald-400 via-mint-300 to-teal-400 bg-clip-text text-transparent">
            EcoTrackr
          </h2>
          <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1 uppercase">Track. Understand. Reduce.</p>
        </div>

        {/* Form Box Container */}
        <div className="glass-card rounded-3xl p-8 border-white/10 shadow-2xl relative">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-zinc-100">Create Account</h3>
            <p className="text-xs text-zinc-400 mt-1">Start tracking your carbon footprint today</p>
          </div>

          {error && (
            <div className="p-4 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5 animate-slide-in">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Account created successfully!</span>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">Logging you in automatically...</p>
              </div>
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
                  placeholder="Choose a username"
                  disabled={loading || success}
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
                  placeholder="Min 4 characters"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold tracking-wide uppercase">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-input pl-11 pr-4 py-3.5 text-sm font-sans"
                  placeholder="Re-enter password"
                  disabled={loading || success}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success || !username || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-extrabold text-sm cursor-pointer transition-all duration-200 transform active:scale-95 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login navigation link */}
          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-white/5 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
