"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  Trophy, 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  Check, 
  Lock, 
  Unlock, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { api, Goal, Challenge } from "@/utils/api";

export default function GoalsAndChallenges() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  // Custom goal form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Transportation");
  const [targetCO2, setTargetCO2] = useState(10.0);
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [goalData, challengeData] = await Promise.all([
        api.getGoals(),
        api.getChallenges()
      ]);
      setGoals(goalData);
      setChallenges(challengeData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#0d9488"]
    });
  };

  const handleChallengeToggle = async (id: number, currentProgress: number, target: number) => {
    const isCompletedNow = currentProgress >= target;
    const nextProgress = isCompletedNow ? 0 : target; // Toggles progress complete/incomplete
    
    try {
      const updated = await api.updateChallengeProgress(id, nextProgress);
      setChallenges(challenges.map(c => c.id === id ? updated : c));
      
      if (updated.completed) {
        triggerConfetti();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || targetCO2 <= 0 || !deadline) return;

    setSubmitting(true);
    try {
      const created = await api.logGoal({
        title,
        category,
        target_co2: targetCO2,
        deadline
      });
      setGoals(prev => [created, ...prev]);
      setTitle("");
      setTargetCO2(10.0);
      setDeadline("");
      triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Syncing Eco-Objectives...</p>
      </div>
    );
  }

  // Check Badge Statuses
  const badges = [
    { name: "Carbon Pioneer", desc: "Set your first custom goal", unlocked: goals.length > 0, icon: "🚀" },
    { name: "Pedal Power", desc: "Log bicycle activities", unlocked: challenges.find(c => c.title === "No Car Day")?.progress! > 0, icon: "🚲" },
    { name: "Clean Utility", desc: "Complete Energy Saver Week", unlocked: !!challenges.find(c => c.title === "Energy Saver Week")?.completed, icon: "🔌" },
    { name: "Eco Champion", desc: "Acquire an EcoScore above 80", unlocked: true, icon: "🏆" }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">Goals & Challenges</h2>
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

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Create Custom Goal Form & Active Goals (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Custom Goal Form */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Target size={16} className="text-emerald-400" />
              <h3 className="text-sm font-extrabold text-zinc-200 tracking-wider uppercase">Create Custom Goal</h3>
            </div>
            
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400 font-bold">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input p-3 text-xs sm:text-sm"
                  placeholder="e.g. Reduce electricity footprint"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-400 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input p-3 text-xs"
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Food">Food</option>
                    <option value="Energy">Energy</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-400 font-bold">Target (kg CO₂)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={targetCO2 || ""}
                    onChange={(e) => setTargetCO2(parseFloat(e.target.value) || 0)}
                    className="glass-input p-3 text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-400 font-bold">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="glass-input p-3 text-xs text-zinc-300 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-extrabold text-xs sm:text-sm cursor-pointer transition"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Set Eco Goal</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Goals Progress List */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400 mb-4">Active Objectives</h3>
            
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 text-zinc-500 border border-dashed border-white/5 rounded-xl gap-2">
                  <Target size={28} className="text-zinc-600" />
                  <p className="text-xs font-bold">No active sustainability goals</p>
                  <p className="text-[10px] text-zinc-600">Create a custom goal above to begin tracking target reductions.</p>
                </div>
              ) : (
                goals.map((goal) => {
                  const pct = Math.min(Math.round((goal.current_co2 / goal.target_co2) * 100), 100);
                  
                  return (
                    <div key={goal.id} className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 flex flex-col gap-3 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider uppercase">
                            {goal.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-200 mt-2">{goal.title}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-bold font-mono">
                          <span>Progress</span>
                          <span>{goal.current_co2.toFixed(1)} / {goal.target_co2.toFixed(0)} kg saved</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              goal.completed ? "bg-emerald-400" : "bg-emerald-500/60"
                            }`} 
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          Deadline: {new Date(goal.deadline).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {goal.completed && (
                          <span className="text-emerald-400 font-bold uppercase tracking-wider">Completed</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Pre-made challenges and Achievements (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Challenges Checkbox list */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Trophy size={16} className="text-emerald-400" />
              <h3 className="text-sm font-extrabold text-zinc-200 tracking-wider uppercase">Active Challenges</h3>
            </div>

            <div className="space-y-3">
              {challenges.map((chall) => {
                const pct = Math.min(Math.round((chall.progress / chall.target) * 100), 100);
                
                return (
                  <div 
                    key={chall.id}
                    onClick={() => handleChallengeToggle(chall.id, chall.progress, chall.target)}
                    className={`p-3.5 rounded-xl border cursor-pointer select-none transition ${
                      chall.completed 
                        ? "border-emerald-500/30 bg-emerald-500/[0.02]" 
                        : "bg-zinc-900/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                          {chall.completed && <Check size={12} className="text-emerald-400" />}
                          {chall.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{chall.description}</p>
                      </div>
                      <div className="w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition border-zinc-700 hover:border-zinc-400">
                        {chall.completed ? <Check size={12} className="text-emerald-400" /> : null}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[8px] font-mono font-bold text-zinc-500">
                        <span>Progress</span>
                        <span>{chall.progress.toFixed(0)}/{chall.target.toFixed(0)} {chall.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges achievements panel */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400 mb-4">Earned Badges</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center text-center border relative ${
                    badge.unlocked 
                      ? "bg-zinc-900/60 border-emerald-500/20 text-zinc-100 shadow-[0_4px_20px_rgba(16,185,129,0.05)]" 
                      : "bg-zinc-950/60 border-white/5 opacity-55 text-zinc-500"
                  }`}
                >
                  <span className="text-3xl mb-2">{badge.icon}</span>
                  <h4 className="text-[10px] font-extrabold tracking-wide uppercase text-zinc-200 mt-1">{badge.name}</h4>
                  <p className="text-[8px] text-zinc-500 mt-0.5 leading-relaxed">{badge.desc}</p>
                  
                  <div className="absolute top-2 right-2">
                    {badge.unlocked ? (
                      <Unlock size={10} className="text-emerald-400" />
                    ) : (
                      <Lock size={10} className="text-zinc-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
