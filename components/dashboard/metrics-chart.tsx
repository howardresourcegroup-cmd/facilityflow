"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { MOCK_TREND_DATA } from "@/lib/mock-data";

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs">
      <p className="text-muted-foreground font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function MetricsChart() {
  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Issue Trend</p>
          <p className="text-base font-semibold text-foreground mt-0.5">Last 7 Days</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />Opened
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />Critical
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={MOCK_TREND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#52525b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="opened" stroke="#6366f1" strokeWidth={2} fill="url(#colorOpened)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
          <Area type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} fill="url(#colorClosed)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
          <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fill="url(#colorCritical)" dot={false} activeDot={{ r: 4, fill: "#ef4444" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
