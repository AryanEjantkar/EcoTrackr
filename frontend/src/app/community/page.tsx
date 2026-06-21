"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  Users, 
  Leaf, 
  Trophy, 
  ArrowUpRight, 
  Flame,
  HelpCircle
} from "lucide-react";
import { api, CommunityUser } from "@/utils/api";

export default function CommunityHub() {
  const [leaderboard, setLeaderboard] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLeaderboard() {
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (e) {
      console.error("Error loading community hub", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Connecting Community Grid...</p>
      </div>
    );
  }

  // Calculate community stats aggregates
  const totalCO2Saved = leaderboard.reduce((sum, u) => sum + u.total_saved, 0);
  const totalTreesSaved = parseFloat((totalCO2Saved / 20.0).toFixed(1)); // 1 tree absorbs ~20kg CO2 per year

  // Find user's profile
  const userProfile = leaderboard.find(u => u.name.includes("You"));
  const userRank = userProfile?.rank || 5;
  const userScore = userProfile?.score || 84;

  const getRankBadge = (scoreVal: number) => {
    if (scoreVal >= 90) return "Gold Eco Master";
    if (scoreVal >= 85) return "Silver Carbon Guard";
    return "Bronze Green Saver";
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">Community Hub</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 font-sans">Track collective impact and compete on the leaderboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-zinc-100 transition relative">
            <Bell size={18} />
          </button>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            YU
          </div>
        </div>
      </header>

      {/* Collective Impact cards banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Total emissions saved card */}
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-emerald-500/[0.03] to-transparent flex justify-between items-center border border-emerald-500/10">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total CO₂ Saved</span>
            <h3 className="text-3xl font-black text-zinc-100 font-mono mt-2">
              {totalCO2Saved.toFixed(1)}
              <span className="text-xs text-zinc-400 font-sans ml-1.5">kg</span>
            </h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Aggregate greenhouse mitigation saved by users</p>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Trophy size={24} />
          </div>
        </div>

        {/* Tree equivalent card */}
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-emerald-500/[0.03] to-transparent flex justify-between items-center border border-emerald-500/10">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Trees Equivalence</span>
            <h3 className="text-3xl font-black text-zinc-100 font-mono mt-2">
              {totalTreesSaved}
              <span className="text-xs text-zinc-400 font-sans ml-1.5">Trees</span>
            </h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">Absorbency equivalent of total carbon saved</p>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Leaf size={24} />
          </div>
        </div>

      </div>

      {/* User profile rank callout */}
      {userProfile && (
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-zinc-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Flame size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Your Current Standing</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Score: <span className="text-emerald-400 font-bold font-mono">{userScore}</span> • Status: <span className="text-emerald-400 font-bold">{getRankBadge(userScore)}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl self-stretch sm:self-auto text-center font-mono">
            Leaderboard Rank: #{userRank}
          </span>
        </div>
      )}

      {/* Leaderboard user list */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400 mb-4 pl-1">Eco Leaderboard</h3>
        
        <div className="space-y-2">
          {leaderboard.map((user) => {
            const isMe = user.name.includes("You");
            
            return (
              <div 
                key={user.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  isMe 
                    ? "border-emerald-500 bg-emerald-500/[0.03]" 
                    : "bg-zinc-900/30 border-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank number badge */}
                  <span className={`w-6 text-center font-mono font-black text-xs ${
                    user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-zinc-300" : user.rank === 3 ? "text-amber-600" : "text-zinc-500"
                  }`}>
                    #{user.rank}
                  </span>

                  {/* Letter Avatar */}
                  <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border ${
                    isMe 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-zinc-800 border-zinc-700 text-zinc-300"
                  }`}>
                    {user.avatar}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                      {user.name}
                      {isMe && (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                          You
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      Score: <span className="font-mono font-bold">{user.score}</span>/100
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-emerald-400">
                    +{user.total_saved.toFixed(1)}kg
                  </span>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono">CO₂ Saved</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
