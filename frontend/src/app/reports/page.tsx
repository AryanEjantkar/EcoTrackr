"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  Printer, 
  FileText, 
  TrendingDown, 
  Leaf, 
  Flame, 
  BarChart,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { api, WeeklyReport as WeeklyReportType } from "@/utils/api";

export default function WeeklyReport() {
  const [report, setReport] = useState<WeeklyReportType | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    try {
      const data = await api.getWeeklyReport();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Compiling AI Sustainability Summaries...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 p-6 text-center">
        <AlertCircle size={32} className="text-rose-400 mb-2" />
        <p className="text-sm font-bold">Failed to load weekly report summaries</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 animate-fade-in max-w-3xl mx-auto w-full">
      
      {/* Header (Hidden when printing) */}
      <header className="flex justify-between items-center pb-4 border-b border-white/5 no-print">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">AI Weekly Report</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 font-sans">AI-generated weekly sustainability audits</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-xl px-4 py-2.5 cursor-pointer transition"
          >
            <Printer size={14} />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Main printable report container */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 print-card print-text relative overflow-hidden">
        
        {/* Floating background design mark (Hidden when printing) */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -z-10 no-print" />
        
        {/* Top Report header details */}
        <div className="flex justify-between items-start pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Leaf size={18} className="animate-pulse" />
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-mint-300 bg-clip-text text-transparent print-text">
                EcoTrackr Report
              </h1>
            </div>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1 font-mono">
              Serial: #ET-2026-{report.report_date.replace(/ /g, "-").toUpperCase()}
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">Date Issued</span>
            <p className="text-xs font-bold text-zinc-200 mt-1 font-mono">{report.report_date}</p>
          </div>
        </div>

        {/* Narrative Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400">Executive Summary</h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">{report.summary}</p>
        </div>

        {/* Aggregate key stats blocks grid */}
        <div className="grid grid-cols-2 gap-4 py-2">
          {/* Stat 1 */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 print-card">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Total Carbon Emissions</span>
            <h4 className="text-xl sm:text-2xl font-black text-zinc-100 font-mono mt-1">
              {report.total_emissions.toFixed(1)}
              <span className="text-xs text-zinc-400 font-sans ml-1">kg CO₂e</span>
            </h4>
          </div>

          {/* Stat 2 */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 print-card">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Tree Absorption Equivalent</span>
            <h4 className="text-xl sm:text-2xl font-black text-zinc-100 font-mono mt-1">
              {report.trees_equivalent.toFixed(1)}
              <span className="text-xs text-zinc-400 font-sans ml-1">Trees</span>
            </h4>
          </div>
        </div>

        {/* Category breakdown comparative list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs tracking-wider uppercase font-extrabold text-zinc-400 flex items-center gap-2">
              <BarChart size={14} />
              <span>Category Contributions</span>
            </h3>
            <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">Weight (kg CO₂)</span>
          </div>

          <div className="space-y-2">
            {Object.entries(report.breakdown).map(([cat, val]) => {
              const percentage = report.total_emissions > 0 
                ? Math.round((val / report.total_emissions) * 100) 
                : 0;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-300">
                    <span className="text-zinc-200">{cat}</span>
                    <span className="font-mono text-zinc-400">{val.toFixed(1)}kg ({percentage}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-400" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hotspot & AI Recommendation callout */}
        <div className="p-5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] space-y-2.5 print-card">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Flame size={14} className="animate-pulse" />
            <span>AI Hotspot & Action Advice</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {report.primary_recommendation}
          </p>
        </div>

        {/* Signatures / stamps */}
        <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-zinc-500 font-mono font-bold">
          <span>EcoTrackr Audit Core</span>
          <span className="text-emerald-400 font-bold uppercase tracking-widest">Verified Carbon Tracker</span>
        </div>

      </div>

      {/* Floating print banner hint (Hidden when printing) */}
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-between text-xs text-zinc-400 no-print">
        <span>Need a paper copy or file upload for work?</span>
        <button 
          onClick={handlePrint}
          className="text-emerald-400 font-bold underline cursor-pointer"
        >
          Print/Download PDF
        </button>
      </div>

    </div>
  );
}
