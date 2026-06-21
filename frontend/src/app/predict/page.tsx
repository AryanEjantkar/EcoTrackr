"use client";

import { useState } from "react";
import { 
  Zap, 
  Car, 
  UtensilsCrossed, 
  Trash2, 
  Tv, 
  Leaf, 
  Sparkles, 
  HelpCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Bot,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { api, PredictCarbonInput, CoachSuggestionCard } from "@/utils/api";

export default function CarbonPredictor() {
  // Input fields state
  const [dayType, setDayType] = useState("Weekday");
  const [transportMode, setTransportMode] = useState("Car");
  const [distanceKm, setDistanceKm] = useState(25);
  const [electricityKwh, setElectricityKwh] = useState(8);
  const [renewableUsagePct, setRenewableUsagePct] = useState(20);
  const [foodType, setFoodType] = useState("Non-Veg");
  const [screenTimeHours, setScreenTimeHours] = useState(6);
  const [wasteGeneratedKg, setWasteGeneratedKg] = useState(0.8);
  const [ecoActions, setEcoActions] = useState(1);

  // Output states
  const [loading, setLoading] = useState(false);
  const [predictedCarbon, setPredictedCarbon] = useState<number | null>(null);
  const [ecoScore, setEcoScore] = useState<number | null>(null);
  const [aiReport, setAiReport] = useState<string>("");
  const [suggestions, setSuggestions] = useState<CoachSuggestionCard[]>([]);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPredictedCarbon(null);
    setEcoScore(null);
    setAiReport("");
    setSuggestions([]);

    try {
      const input: PredictCarbonInput = {
        day_type: dayType,
        transport_mode: transportMode,
        distance_km: distanceKm,
        electricity_kwh: electricityKwh,
        renewable_usage_pct: renewableUsagePct,
        food_type: foodType,
        screen_time_hours: screenTimeHours,
        waste_generated_kg: wasteGeneratedKg,
        eco_actions: ecoActions
      };

      // 1. Run ML Random Forest prediction
      const mlRes = await api.predictCarbon(input);
      setPredictedCarbon(mlRes.predicted_carbon_footprint);
      setEcoScore(mlRes.eco_score);

      // 2. Run Gemini AI Coach Analysis
      const prompt = `
        Analyze this user's simulated carbon footprint behavior and generate personalized recommendations to reduce emissions.
        
        Simulated Input Metrics:
        - Day Type: ${dayType}
        - Primary Transport: ${transportMode} (${distanceKm} km/day)
        - Energy Usage: ${electricityKwh} kWh/day (${renewableUsagePct}% renewable)
        - Diet: ${foodType}
        - Screen Time: ${screenTimeHours} hours/day
        - Daily Waste: ${wasteGeneratedKg} kg
        - Logged Eco Actions: ${ecoActions} actions
        
        ML Predicted Output:
        - Carbon Footprint: ${mlRes.predicted_carbon_footprint} kg CO2
        - Simulated EcoScore: ${mlRes.eco_score} / 100
        
        Please identify their primary carbon hotspot, list specific reduction opportunities, estimate potential CO2 savings, and provide a weekly action plan.
      `;

      const aiRes = await api.consultCoach(prompt);
      setAiReport(aiRes.response);
      setSuggestions(aiRes.suggestions);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-6xl mx-auto w-full">
      <header className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">EcoPredictor</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 font-sans">Simulate lifestyle footprints using Random Forest Regressor</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Side: Input Parameters Form (3/5 Columns) */}
        <form onSubmit={handleSimulate} className="lg:col-span-3 glass-card rounded-3xl p-6 border-white/10 space-y-5">
          <h3 className="text-sm font-extrabold tracking-widest text-emerald-400 uppercase pb-2 border-b border-white/5 flex items-center gap-2">
            <Sparkles size={16} />
            <span>Behavior Simulator Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Day Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">Day Classification</label>
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value)}
                className="glass-input p-3 text-sm"
              >
                <option value="Weekday" className="bg-zinc-900 text-zinc-200">Weekday</option>
                <option value="Weekend" className="bg-zinc-900 text-zinc-200">Weekend</option>
              </select>
            </div>

            {/* Food Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">Diet Classification</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="glass-input p-3 text-sm"
              >
                <option value="Non-Veg" className="bg-zinc-900 text-zinc-200">Non-Veg (Meat-Intensive)</option>
                <option value="Veg" className="bg-zinc-900 text-zinc-200">Vegetarian</option>
                <option value="Vegan" className="bg-zinc-900 text-zinc-200">Vegan / Plant-Based</option>
              </select>
            </div>

            {/* Transport Mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-bold">Transport Mode</label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="glass-input p-3 text-sm"
              >
                <option value="Car" className="bg-zinc-900 text-zinc-200">Personal Car</option>
                <option value="Public Transport" className="bg-zinc-900 text-zinc-200">Public Transit (Bus/Metro)</option>
                <option value="Bike" className="bg-zinc-900 text-zinc-200">Bicycle</option>
                <option value="Walking" className="bg-zinc-900 text-zinc-200">Walking / Foot</option>
              </select>
            </div>

            {/* Distance Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Travel Distance</span>
                <span className="text-emerald-400 font-mono">{distanceKm} km</span>
              </div>
              <input 
                type="range" min="0" max="100" value={distanceKm}
                onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                className="accent-emerald-400 cursor-pointer h-1.5 rounded-full bg-zinc-800"
              />
            </div>

            {/* Electricity Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Electricity Consumed</span>
                <span className="text-emerald-400 font-mono">{electricityKwh} kWh</span>
              </div>
              <input 
                type="range" min="0" max="50" value={electricityKwh}
                onChange={(e) => setElectricityKwh(parseInt(e.target.value))}
                className="accent-emerald-400 cursor-pointer h-1.5 rounded-full bg-zinc-800"
              />
            </div>

            {/* Renewable Percentage */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Renewable energy ratio</span>
                <span className="text-emerald-400 font-mono">{renewableUsagePct}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={renewableUsagePct}
                onChange={(e) => setRenewableUsagePct(parseInt(e.target.value))}
                className="accent-emerald-400 cursor-pointer h-1.5 rounded-full bg-zinc-800"
              />
            </div>

            {/* Screen Time */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Screen Time</span>
                <span className="text-emerald-400 font-mono">{screenTimeHours} hours</span>
              </div>
              <input 
                type="range" min="0" max="24" value={screenTimeHours}
                onChange={(e) => setScreenTimeHours(parseInt(e.target.value))}
                className="accent-emerald-400 cursor-pointer h-1.5 rounded-full bg-zinc-800"
              />
            </div>

            {/* Waste Generated */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Waste Generated</span>
                <span className="text-emerald-400 font-mono">{wasteGeneratedKg} kg</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.1" value={wasteGeneratedKg}
                onChange={(e) => setWasteGeneratedKg(parseFloat(e.target.value))}
                className="accent-emerald-400 cursor-pointer h-1.5 rounded-full bg-zinc-800"
              />
            </div>

            {/* Eco Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Sustainability Actions</span>
                <span className="text-emerald-400 font-mono">{ecoActions} actions</span>
              </div>
              <input 
                type="range" min="0" max="6" value={ecoActions}
                onChange={(e) => setEcoActions(parseInt(e.target.value))}
                className="accent-emerald-400 cursor-pointer h-1.5 rounded-full bg-zinc-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 mt-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-950 font-extrabold text-sm cursor-pointer transition shadow-lg shadow-emerald-500/10"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Zap size={16} />
                <span>Run Footprint Prediction</span>
              </>
            )}
          </button>
        </form>

        {/* Right Side: Prediction Output & AI report (2/5 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Prediction Score Box */}
          <div className="glass-card rounded-3xl p-6 border-white/10 flex flex-col justify-between min-h-[220px] bg-gradient-to-br from-zinc-900/50 to-emerald-950/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>
            
            {predictedCarbon !== null && ecoScore !== null ? (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">PREDICTED CARBON FOOTPRINT</span>
                    <h3 className="text-4xl font-black text-zinc-100 mt-2 font-mono tracking-tight">
                      {predictedCarbon.toFixed(2)}
                      <span className="text-sm font-semibold text-zinc-400 ml-1.5 font-sans">kg CO₂e</span>
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">SIMULATED ECO_SCORE</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xl font-extrabold text-zinc-200 font-mono">{ecoScore} / 100</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full font-bold uppercase font-mono tracking-wide">
                    {ecoScore > 80 ? "Premium" : (ecoScore > 50 ? "Balanced" : "High Hotspot")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 gap-2 border border-dashed border-white/5 rounded-2xl h-full min-h-[160px]">
                <HelpCircle size={36} strokeWidth={1.5} className="text-zinc-600" />
                <p className="text-xs font-bold text-zinc-400">No Simulation Active</p>
                <p className="text-[10px] text-zinc-500">Configure parameters on the left and run prediction to generate AI insights.</p>
              </div>
            )}
          </div>

          {/* Dynamic AI Report Card */}
          {aiReport && (
            <div className="glass-card rounded-3xl p-6 border-white/10 space-y-4 animate-slide-up bg-zinc-950/40">
              <h3 className="text-xs font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-2 pb-2 border-b border-white/5">
                <Bot size={16} />
                <span>Gemini Coach recommendations</span>
              </h3>

              <div className="text-xs leading-relaxed text-zinc-300 space-y-3">
                {aiReport.split("\n\n").map((para, index) => (
                  <p key={index}>
                    {para.split("**").map((part, idx) => 
                      idx % 2 === 1 ? <strong key={idx} className="text-emerald-400 font-bold">{part}</strong> : part
                    )}
                  </p>
                ))}
              </div>

              {suggestions && suggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">
                    Action Plan Savings:
                  </span>
                  {suggestions.map((sug, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">{sug.title}</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">{sug.details}</p>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 flex-shrink-0 ml-4">
                        -{sug.co2_saving.toFixed(1)}kg CO₂
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
