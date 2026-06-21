"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  MapPin, 
  Search, 
  Navigation, 
  Bike, 
  Compass, 
  Footprints, 
  Bus, 
  Train, 
  Car,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  Check
} from "lucide-react";
import { api, RouteOption } from "@/utils/api";

export default function RouteOptimizer() {
  const [origin, setOrigin] = useState("Union Square, SF");
  const [destination, setDestination] = useState("Fisherman's Wharf, SF");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await api.getRoutes(origin, destination);
      setRoutes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper icons
  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "walking": return <Footprints size={18} />;
      case "bicycle": return <Bike size={18} />;
      case "metro": return <Train size={18} />;
      case "bus": return <Bus size={18} />;
      default: return <Car size={18} />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "walking": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "bicycle": return "text-mint-400 bg-mint-500/10 border-mint-500/20";
      case "metro": return "text-teal-400 bg-teal-500/10 border-teal-500/20";
      case "bus": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      default: return "text-zinc-500 bg-zinc-800/40 border-white/5";
    }
  };

  // Find car footprint to calculate comparative saving
  const carRoute = routes.find(r => r.mode === "Car");
  const recommendedRoute = routes.find(r => r.recommended);

  const co2Saved = carRoute && recommendedRoute 
    ? Math.max(carRoute.co2 - recommendedRoute.co2, 0) 
    : 0.0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">Green Route Optimizer</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 font-sans">Compare carbon factors of commute navigation alternatives</p>
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

      {/* Inputs Form */}
      <form onSubmit={handleSearch} className="glass-card rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 glass-input px-3 py-1">
            <MapPin size={16} className="text-zinc-500" />
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-transparent border-0 focus:ring-0 text-sm py-2.5 text-zinc-200 outline-none"
              placeholder="Origin location"
            />
          </div>

          <div className="flex items-center gap-3 glass-input px-3 py-1">
            <Navigation size={16} className="text-zinc-500" />
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent border-0 focus:ring-0 text-sm py-2.5 text-zinc-200 outline-none"
              placeholder="Destination address"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-extrabold text-xs sm:text-sm cursor-pointer transition"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Search size={16} />
              <span>Optimize Route</span>
            </>
          )}
        </button>
      </form>

      {/* Core comparison content layout */}
      {loading ? (
        <div className="glass-card rounded-2xl p-16 min-h-[350px] flex flex-col items-center justify-center text-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mb-2"></div>
          <p className="text-xs text-zinc-400 font-medium">Computing emission routing alternatives...</p>
        </div>
      ) : searched && routes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Glowing SVG Route Map Overlay (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="glass-card rounded-2xl overflow-hidden relative min-h-[320px] bg-zinc-950/40 flex flex-col border border-white/5 shadow-2xl">
              
              {/* Floating Carbon savings overlay badge */}
              {co2Saved > 0 && (
                <div className="absolute top-4 left-4 z-10 glass-panel bg-emerald-500/10 border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2.5 animate-slide-up">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-mono">Impact Score</h4>
                    <p className="text-xs text-zinc-200 font-bold font-mono">{co2Saved.toFixed(1)} kg CO₂ Saved</p>
                  </div>
                </div>
              )}

              {/* Glowing Interactive Mock SVG Map */}
              <div className="flex-1 w-full flex items-center justify-center relative p-6 select-none bg-[radial-gradient(#181d2c_1px,transparent_1px)] [background-size:16px_16px]">
                <svg viewBox="0 0 400 240" className="w-full max-w-[360px] h-auto">
                  {/* Base Road Networks (thin lines) */}
                  <path d="M 40 180 Q 140 160 220 80 T 360 60" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth={4} />
                  <path d="M 40 180 Q 80 80 180 60 T 360 60" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth={4} />
                  <path d="M 40 180 L 360 60" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth={4} />

                  {/* Route 1: Car Route (Reddish line) */}
                  <path 
                    d="M 50 170 Q 160 190 280 120 T 350 70" 
                    fill="transparent" 
                    stroke="rgba(239, 68, 68, 0.25)" 
                    strokeWidth={4} 
                  />

                  {/* Route 2: Green Recommended Route (Metro/Bicycle, emerald path with crawling dashes) */}
                  <path 
                    d="M 50 170 Q 100 80 220 90 T 350 70" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth={5} 
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                  />
                  {/* Crawling crawling dash overlay */}
                  <path 
                    d="M 50 170 Q 100 80 220 90 T 350 70" 
                    fill="transparent" 
                    stroke="#a7f3d0" 
                    strokeWidth={5} 
                    strokeLinecap="round"
                    strokeDasharray="10 40"
                    strokeDashoffset="0"
                  >
                    <animate attributeName="stroke-dashoffset" values="500;0" dur="15s" repeatCount="indefinite" />
                  </path>

                  {/* Start Node Indicator */}
                  <circle cx="50" cy="170" r="10" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth={2} />
                  <circle cx="50" cy="170" r="4" fill="#10b981" />
                  <text x="35" y="195" fill="#a1a1aa" fontSize="8" fontWeight="bold" fontFamily="sans-serif">ORIGIN</text>

                  {/* End Node Indicator */}
                  <circle cx="350" cy="70" r="10" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth={2} />
                  <circle cx="350" cy="70" r="4" fill="#22d3ee" />
                  <text x="325" y="50" fill="#a1a1aa" fontSize="8" fontWeight="bold" fontFamily="sans-serif">DESTINATION</text>
                </svg>
              </div>

              {/* Map Footer status */}
              <div className="p-4 border-t border-white/5 flex justify-between items-center bg-zinc-900/20 text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Compass size={12} className="animate-spin" style={{ animationDuration: "12s" }} />
                  <span>Mapping engine active</span>
                </span>
                <span>Seed layout 104-SF</span>
              </div>
            </div>

          </div>

          {/* Right Column: Route Alternatives List (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400">Route Alternatives</h3>
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Sorted by CO₂</span>
            </div>

            <div className="space-y-3">
              {routes.map((route, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border flex items-center justify-between transition ${
                    route.recommended 
                      ? "border-emerald-500 bg-emerald-500/[0.03] shadow-md shadow-emerald-500/[0.02]" 
                      : "bg-zinc-900/40 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${getModeColor(route.mode)} flex-shrink-0`}>
                      {getModeIcon(route.mode)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                        {route.mode}
                        {route.recommended && (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                            Recommended
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 mt-1.5">
                        <Clock size={11} />
                        {route.duration.toFixed(0)} mins • {route.distance.toFixed(1)} km
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-mono font-black ${route.co2 === 0.0 ? "text-emerald-400" : "text-rose-300"}`}>
                      {route.co2.toFixed(1)}kg
                    </span>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono">CO₂</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prompt to log the optimized choice */}
            {recommendedRoute && (
              <Link 
                href="/tracking"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs cursor-pointer transition mt-2"
              >
                <span>Log this recommended trip</span>
                <ArrowRight size={14} />
              </Link>
            )}

          </div>

        </div>
      ) : (
        <div className="glass-card rounded-2xl p-16 min-h-[350px] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
            <Compass size={22} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-300">Route comparator ready</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-[220px] mx-auto">
              Enter origin and destination locations above to retrieve carbon-optimal commutes.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
