"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FadeIn } from "@/components/animations/fade-in";
import { BarChart3 } from "lucide-react";

interface AdminChartsProps {
  data: any[];
}

export function AdminCharts({ data }: AdminChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-80 w-full rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50 flex items-center justify-center">
        <span className="text-xs text-neutral-450">Memuat grafik analitik...</span>
      </div>
    );
  }

  return (
    <FadeIn className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 size={16} className="text-neutral-500" />
          Tren Pendapatan Mingguan
        </h3>
        <span className="text-[10px] text-neutral-400 font-medium">Updated just now</span>
      </div>

      <div className="h-72 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="name"
              stroke="#a3a3a3"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#a3a3a3"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `Rp ${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              formatter={(value: any) => [`Rp ${Number(value).toLocaleString("id-ID")}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
}
