"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  CartesianGrid
} from "recharts";

interface ForecastDataPoint {
  date: string;
  emissions: number;
  is_predicted: boolean;
}

interface ForecastChartProps {
  data: ForecastDataPoint[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
  // Format dates for display (e.g., "Jun 19")
  const formattedData = data.map(item => {
    const d = new Date(item.date);
    const label = d.toLocaleDateString([], { month: "short", day: "numeric" });
    return {
      ...item,
      displayDate: label
    };
  });

  // Split data into actual vs predicted for rendering nice continuous lines
  // We can render two overlapping lines: one for actual, one for predicted
  const actualData = formattedData.map(item => ({
    displayDate: item.displayDate,
    emissions: item.is_predicted ? null : item.emissions
  }));

  const predictedData = formattedData.map((item, idx) => {
    // For predicted line, we need the last actual point to connect it smoothly!
    const isFirstPrediction = item.is_predicted && idx > 0 && !formattedData[idx - 1].is_predicted;
    if (isFirstPrediction) {
      return {
        displayDate: item.displayDate,
        emissions: formattedData[idx - 1].emissions
      };
    }
    return {
      displayDate: item.displayDate,
      emissions: item.is_predicted ? item.emissions : null
    };
  });

  return (
    <div className="w-full h-[320px] glass-card rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-zinc-100">Carbon Projections</h3>
          <p className="text-xs text-zinc-400">Comparing logged history against next week's AI forecast</p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Logged Actual</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 border-t border-dashed border-emerald-400"></span>
            <span className="text-emerald-400">Predicted Trend</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#71717a" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}kg`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#0d1426", 
                borderColor: "rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px"
              }}
              formatter={(value, name, props) => {
                const item = formattedData[(props as any).index || 0];
                const typeLabel = item.is_predicted ? "AI Projected" : "Logged Actual";
                return [`${value} kg CO₂`, typeLabel];
              }}
            />
            
            {/* Actual line (solid) */}
            <Line 
              type="monotone" 
              dataKey="emissions" 
              data={actualData}
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ stroke: '#070a13', strokeWidth: 2, fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />

            {/* Predicted line (dashed) */}
            <Line 
              type="monotone" 
              dataKey="emissions" 
              data={predictedData}
              stroke="#10b981" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ stroke: '#070a13', strokeWidth: 2, fill: '#34d399', r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
            
            {/* Draw current day threshold line */}
            <ReferenceLine 
              x={formattedData[6]?.displayDate} 
              stroke="rgba(255,255,255,0.15)" 
              strokeWidth={1.5}
              label={{ 
                value: "TODAY", 
                fill: "#71717a", 
                fontSize: 9, 
                fontWeight: "bold",
                position: "top"
              }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
