"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from "recharts";

interface BarData {
  name: string;
  emissions: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface ChartsProps {
  barData: BarData[];
  pieData: PieData[];
  ecoScore: number;
}

export default function DashboardCharts({ barData, pieData, ecoScore }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Carbon Trend Bar Chart */}
      <div className="glass-card rounded-2xl p-6 flex flex-col min-h-[350px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Carbon Trend</h3>
            <p className="text-xs text-zinc-400">Weekly emission details in kg CO₂</p>
          </div>
          <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-zinc-700 transition">
            Last 7 Days
          </span>
        </div>
        
        <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0d1426", 
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#fff"
                }}
                labelStyle={{ color: "#71717a", fontWeight: "bold" }}
              />
              <Bar 
                dataKey="emissions" 
                fill="url(#emeraldGradient)" 
                radius={[6, 6, 0, 0]} 
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emission Breakdown Pie Chart */}
      <div className="glass-card rounded-2xl p-6 flex flex-col min-h-[350px]">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Emission Breakdown</h3>
          <p className="text-xs text-zinc-400">Carbon distribution by activity category</p>
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
          <div className="w-[180px] h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0d1426", 
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#fff"
                  }}
                  formatter={(value) => [`${value}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-zinc-100">{ecoScore}</span>
              <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">EcoScore</span>
            </div>
          </div>

          {/* Custom Custom Legend Grid */}
          <div className="flex-1 space-y-2 w-full max-w-[200px]">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-zinc-300 font-medium text-xs sm:text-sm">{item.name}</span>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
