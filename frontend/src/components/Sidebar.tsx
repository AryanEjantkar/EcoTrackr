"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare, 
  ScanLine, 
  TrendingUp, 
  Trophy, 
  MapPin, 
  Users, 
  FileText,
  Leaf,
  Zap
} from "lucide-react";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  mobile: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, mobile: true },
  { name: "Activity", href: "/tracking", icon: PlusCircle, mobile: true },
  { name: "AI Coach", href: "/coach", icon: MessageSquare, mobile: true },
  { name: "Simulator", href: "/predict", icon: Zap, mobile: false },
  { name: "Green Route", href: "/routes", icon: MapPin, mobile: true },
  { name: "OCR Scanner", href: "/ocr", icon: ScanLine, mobile: false },
  { name: "Forecast", href: "/forecast", icon: TrendingUp, mobile: false },
  { name: "Challenges", href: "/challenges", icon: Trophy, mobile: false },
  { name: "Community", href: "/community", icon: Users, mobile: false },
  { name: "Weekly Report", href: "/reports", icon: FileText, mobile: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [username, setUsername] = useState("EcoTrackr");
  const [ecoScore, setEcoScore] = useState(84);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await api.getMe();
        if (user && user.username && user.username !== "Guest") {
          setUsername(user.username);
          const acts = await api.getActivities();
          const today = new Date().toISOString().split("T")[0];
          const dailyFootprint = acts
            .filter(a => a.timestamp.startsWith(today))
            .reduce((sum, a) => sum + a.co2_emissions, 0);
          const score = Math.max(0, Math.min(100, Math.round(100 - dailyFootprint * 5)));
          setEcoScore(score);
        } else {
          setUsername("Guest User");
          setEcoScore(100);
        }
      } catch (e) {
        console.error("Error loading user profile in sidebar", e);
      }
    }
    loadUser();
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/5 bg-zinc-950/60 p-5 z-20">
        {/* Glowing Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 animate-pulse-glow">
            <Leaf size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-mint-300 to-teal-400 bg-clip-text text-transparent">
              EcoTrackr
            </h1>
            <p className="text-[10px] text-zinc-400 tracking-widest uppercase font-semibold">Track. Understand. Reduce.</p>
          </div>
        </div>

        {/* Desktop Menu Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer profile tag */}
        <div className="border-t border-white/5 pt-4 mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200">{username}</p>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
              EcoScore: {ecoScore}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-zinc-950/80 backdrop-blur-lg border-t border-white/5 flex justify-around items-center px-2 py-1 z-50">
        {navItems
          .filter((item) => item.mobile)
          .map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            const shortName = item.name === "Green Route" ? "Map" : item.name;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-20 h-full rounded-xl transition-all duration-200 ${
                  isActive ? "text-emerald-400 font-semibold" : "text-zinc-500"
                }`}
              >
                <div className={`p-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-emerald-500/10" : ""}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] tracking-wide mt-0.5">{shortName}</span>
              </Link>
            );
          })}
        
        {/* Quick OCR Scanner shortcut button for mobile, to have easy access */}
        <Link
          href="/ocr"
          className={`flex flex-col items-center justify-center w-20 h-full rounded-xl transition-all duration-200 ${
            pathname === "/ocr" ? "text-emerald-400 font-semibold" : "text-zinc-500"
          }`}
        >
          <div className={`p-1.5 rounded-full transition-all duration-200 ${pathname === "/ocr" ? "bg-emerald-500/10" : ""}`}>
            <ScanLine size={20} />
          </div>
          <span className="text-[10px] tracking-wide mt-0.5">Scan</span>
        </Link>
      </div>
    </>
  );
}
