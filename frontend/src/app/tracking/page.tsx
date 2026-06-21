"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  Car, 
  UtensilsCrossed, 
  Zap, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Sparkles,
  Camera,
  Calendar,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { api, Activity, Challenge } from "@/utils/api";

type CategoryKey = "Transportation" | "Food" | "Energy" | "Shopping";

interface SubcatOption {
  label: string;
  unit: string;
  defaultVal: number;
}

const SUBCATEGORIES: Record<CategoryKey, Record<string, SubcatOption>> = {
  Transportation: {
    Car: { label: "Car Travel", unit: "km", defaultVal: 15 },
    Bike: { label: "Bicycle Ride", unit: "km", defaultVal: 5 },
    "Public Transport": { label: "Public Transit", unit: "km", defaultVal: 10 },
    Flight: { label: "Airplane Travel", unit: "km", defaultVal: 800 }
  },
  Energy: {
    Electricity: { label: "Electricity Usage", unit: "kWh", defaultVal: 5 },
    AC: { label: "AC Running Time", unit: "hours", defaultVal: 4 },
    Appliances: { label: "Home Appliances", unit: "hours", defaultVal: 2 }
  },
  Food: {
    "Vegetarian Meal": { label: "Vegetarian Meal", unit: "meals", defaultVal: 1 },
    "Non-Vegetarian Meal": { label: "Non-Veg (Meat) Meal", unit: "meals", defaultVal: 1 },
    "Food Waste": { label: "Food Spoilage/Waste", unit: "kg", defaultVal: 0.5 }
  },
  Shopping: {
    "Online Purchase": { label: "Online Order", unit: "items", defaultVal: 1 },
    Electronics: { label: "Electronic Device", unit: "items", defaultVal: 1 },
    Clothing: { label: "Clothing / Apparel", unit: "items", defaultVal: 1 }
  }
};

export default function ActivityTracker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  
  // Form states
  const [subcategory, setSubcategory] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [actData, challengeData] = await Promise.all([
        api.getActivities(),
        api.getChallenges()
      ]);
      setActivities(actData);
      setChallenges(challengeData);
    } catch (e) {
      console.error("Error loading activities tracker", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCategorySelect = (cat: CategoryKey) => {
    setSelectedCategory(cat);
    const firstSub = Object.keys(SUBCATEGORIES[cat])[0];
    setSubcategory(firstSub);
    setQuantity(SUBCATEGORIES[cat][firstSub].defaultVal);
    setNotes("");
  };

  const handleSubcategoryChange = (sub: string) => {
    if (!selectedCategory) return;
    setSubcategory(sub);
    setQuantity(SUBCATEGORIES[selectedCategory][sub].defaultVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || quantity <= 0) return;
    
    setSubmitting(true);
    try {
      await api.logActivity({
        category: selectedCategory,
        subcategory,
        quantity,
        notes: notes.trim() || undefined
      });
      // Clear panel
      setSelectedCategory(null);
      // Reload lists
      await loadData();
    } catch (err) {
      console.error("Error logging activity", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteActivity(id);
      setActivities(activities.filter(a => a.id !== id));
      // Reload to recalculate challenges progress
      loadData();
    } catch (err) {
      console.error("Error deleting activity", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Syncing Activity Registries...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">Log Activity</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 font-sans">Input daily actions and monitor footprints</p>
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

      {/* 4 Main Action Category Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Transportation */}
        <button
          onClick={() => handleCategorySelect("Transportation")}
          className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer text-center group ${
            selectedCategory === "Transportation" ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5" : ""
          }`}
        >
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl transition-transform duration-200 group-hover:scale-110">
            <Car size={24} />
          </div>
          <span className="text-[11px] sm:text-xs tracking-wider uppercase font-extrabold text-zinc-300">Transport</span>
        </button>

        {/* Food */}
        <button
          onClick={() => handleCategorySelect("Food")}
          className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer text-center group ${
            selectedCategory === "Food" ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5" : ""
          }`}
        >
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl transition-transform duration-200 group-hover:scale-110">
            <UtensilsCrossed size={24} />
          </div>
          <span className="text-[11px] sm:text-xs tracking-wider uppercase font-extrabold text-zinc-300">Food</span>
        </button>

        {/* Home Energy */}
        <button
          onClick={() => handleCategorySelect("Energy")}
          className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer text-center group ${
            selectedCategory === "Energy" ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5" : ""
          }`}
        >
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl transition-transform duration-200 group-hover:scale-110">
            <Zap size={24} />
          </div>
          <span className="text-[11px] sm:text-xs tracking-wider uppercase font-extrabold text-zinc-300">Home Energy</span>
        </button>

        {/* Shopping */}
        <button
          onClick={() => handleCategorySelect("Shopping")}
          className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer text-center group ${
            selectedCategory === "Shopping" ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5" : ""
          }`}
        >
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl transition-transform duration-200 group-hover:scale-110">
            <ShoppingBag size={24} />
          </div>
          <span className="text-[11px] sm:text-xs tracking-wider uppercase font-extrabold text-zinc-300">Shopping</span>
        </button>

      </div>

      {/* Expandable Action Form Drawer */}
      {selectedCategory && (
        <form 
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 border-emerald-500/30 bg-emerald-500/[0.02] space-y-4 animate-slide-up"
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-sm font-extrabold tracking-widest text-emerald-400 uppercase">
              Logging {selectedCategory}
            </h3>
            <button 
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subcategory selection dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">Activity Subtype</label>
              <select
                value={subcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="glass-input p-3 text-sm"
              >
                {Object.entries(SUBCATEGORIES[selectedCategory]).map(([key, opt]) => (
                  <option key={key} value={key} className="bg-zinc-900 text-zinc-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Numeric input value */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">
                Quantity ({subcategory ? SUBCATEGORIES[selectedCategory][subcategory]?.unit : ""})
              </label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                value={quantity || ""}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="glass-input p-3 text-sm font-mono"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Optional notes input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-bold">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input p-3 text-sm"
              placeholder="e.g. Morning commute, vegetarian dinner with family"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || quantity <= 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-extrabold text-sm cursor-pointer transition shadow-lg shadow-emerald-500/10"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Plus size={16} />
                <span>Save to Carbon Log</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Smart OCR receipt scan quick trigger banner */}
      <Link 
        href="/ocr"
        className="glass-panel hover:border-emerald-500/30 p-4 rounded-2xl flex justify-between items-center bg-gradient-to-r from-emerald-500/[0.08] to-transparent border border-emerald-500/15 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
            <Camera size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-200">AI Receipt Scanner</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Upload grocery receipts or electric bills for instant logging</p>
          </div>
        </div>
        <Sparkles size={16} className="text-emerald-400 group-hover:animate-pulse" />
      </Link>

      {/* Section split layout: Quick log history (Left) & Daily Goals (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Quick Log activity list */}
        <div className="glass-card rounded-2xl p-6 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400">Quick Log History</h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">Recent entries</span>
          </div>

          <div className="flex-1 space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 gap-2 border border-dashed border-white/5 rounded-xl">
                <HelpCircle size={32} strokeWidth={1.5} />
                <p className="text-xs font-semibold">No carbon activities recorded yet</p>
                <p className="text-[10px] text-zinc-600">Select a category above to post your first entry!</p>
              </div>
            ) : (
              activities.map((act) => {
                // Pick icon matching subcategory/category
                const isCar = act.subcategory === "Car" || act.category === "Transportation";
                const isFood = act.category === "Food";
                const isEnergy = act.category === "Energy";

                return (
                  <div key={act.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                        {isCar && <Car size={16} />}
                        {isFood && <UtensilsCrossed size={16} />}
                        {isEnergy && <Zap size={16} />}
                        {!isCar && !isFood && !isEnergy && <ShoppingBag size={16} />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">
                          {act.quantity} {act.subcategory === "Car" ? "km Ride" : act.subcategory === "Vegetarian Meal" ? "Veg Meal" : act.subcategory}
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Calendar size={10} />
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-rose-300">{act.co2_emissions}kg</span>
                        <p className="text-[8px] text-zinc-500 font-semibold tracking-wider font-mono">CO₂e</p>
                      </div>
                      <button
                        onClick={() => handleDelete(act.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition duration-150 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Daily Challenges list */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400 mb-4">Daily Challenges</h3>
            
            <div className="space-y-5">
              {challenges.slice(0, 3).map((chall) => {
                const pct = Math.min(Math.round((chall.progress / chall.target) * 100), 100);
                
                return (
                  <div key={chall.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-200 flex items-center gap-2">
                        {chall.completed && <CheckCircle size={14} className="text-emerald-400" />}
                        {chall.title}
                      </span>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {chall.progress.toFixed(0)}/{chall.target.toFixed(0)} {chall.unit}
                      </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          chall.completed 
                            ? "bg-gradient-to-r from-emerald-400 to-mint-400" 
                            : "bg-emerald-500/60"
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-start gap-2.5">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
              <Sparkles size={12} className="animate-pulse" />
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Keep it up! You're saving <span className="text-emerald-400 font-bold font-mono">1.2kg more CO₂</span> today than average.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
