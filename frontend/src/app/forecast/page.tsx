"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck,
  Zap, 
  ArrowRight,
  Bike,
  UtensilsCrossed
} from "lucide-react";
import { api, ForecastPoint } from "@/utils/api";

const ForecastChart = dynamic(() => import("@/components/ForecastChart"), { ssr: false });

export default function CarbonForecasting() {
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [alert, setAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        const data = await api.getForecast();
        setForecastData(data.forecast);
        setAlert(data.alert);
        setMessage(data.message);
      } catch (err) {
        console.error("Error loading forecasting metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Synthesizing Machine Learning Models...</p>
      </div>
    );
  }

  // Calculate stats from forecast data
  const historicalPoints = forecastData.filter(p => !p.is_predicted);
  const predictedPoints = forecastData.filter(p => p.is_predicted);

  const avgHistorical = historicalPoints.reduce((sum, p) => sum + p.emissions, 0) / Math.max(historicalPoints.length, 1);
  const avgPredicted = predictedPoints.reduce((sum, p) => sum + p.emissions, 0) / Math.max(predictedPoints.length, 1);

  const percentageDiff = avgHistorical > 0 ? ((avgPredicted - avgHistorical) / avgHistorical) * 100 : 0;
  const isRising = percentageDiff > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">Carbon Forecasting</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 font-sans">AI predictive analytics and footprint projections</p>
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

      {/* Main Forecast Chart Widget */}
      <ForecastChart data={forecastData} />

      {/* Grid of ML Performance and Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Weekly Avg Projection */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">Projected Output</span>
          <div>
            <h4 className="text-2xl font-black text-zinc-100 mt-2 font-mono">
              {(avgPredicted * 7).toFixed(1)}
              <span className="text-xs text-zinc-400 font-sans ml-1.5">kg CO₂</span>
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">Next 7 days total emissions</p>
          </div>
        </div>

        {/* Trend percentage card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">Trend Deviation</span>
          <div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`p-1 rounded ${isRising ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                {isRising ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </span>
              <span className={`text-xl font-bold font-mono ${isRising ? "text-rose-400" : "text-emerald-400"}`}>
                {isRising ? "+" : ""}{percentageDiff.toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Compared to past 7 days average</p>
          </div>
        </div>

        {/* System parameters card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">Model Accuracy</span>
          <div>
            <div className="flex items-center gap-2 mt-2 text-emerald-400">
              <ShieldCheck size={18} />
              <span className="text-xl font-bold font-mono">94%</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Confidence (R² variance: 0.92)</p>
          </div>
        </div>

      </div>

      {/* Interactive warning or success panels */}
      <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
        alert 
          ? "border-rose-500/10 bg-rose-500/[0.02] text-rose-300"
          : "border-emerald-500/10 bg-emerald-500/[0.02] text-emerald-300"
      }`}>
        <div className={`p-3 rounded-xl flex-shrink-0 ${alert ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-zinc-200">AI Forecasting Analysis</h4>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1 font-sans">{message}</p>
        </div>
      </div>

      {/* Sustainable habits mitigations suggestions */}
      <div className="space-y-3">
        <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400 pl-1">
          Proactive Carbon Reduction Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1 */}
          <Link 
            href="/routes"
            className="glass-card p-4 rounded-xl flex justify-between items-center group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                <Bike size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Check Green Routes</h4>
                <p className="text-[9px] text-zinc-500 mt-0.5">Mitigate driving mileage emissions</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-emerald-400 transition" />
          </Link>

          {/* Action 2 */}
          <Link 
            href="/tracking"
            className="glass-card p-4 rounded-xl flex justify-between items-center group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                <UtensilsCrossed size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Plan Meatless Dinners</h4>
                <p className="text-[9px] text-zinc-500 mt-0.5">Shift carbon factors instantly</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-emerald-400 transition" />
          </Link>
        </div>
      </div>

    </div>
  );
}
