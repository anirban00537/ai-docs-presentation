import React, { useCallback, useMemo } from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { type PulseMetricContent } from "../definitions/pulse-metric";
import { withAlpha } from "../utils";

interface PulseMetricBlockProps {
  block: Block;
  onUpdate: (content: PulseMetricContent) => void;
  theme: Theme;
}

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const PulseMetricBlock: React.FC<PulseMetricBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = block.content as PulseMetricContent;
  const { value, label, trend, sparklineType = "smooth" } = content;

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const trimmed = newValue.trim();
      
      let newTrend = trend;
      
      if (trimmed.startsWith("-")) {
        newTrend = "down";
      } else if (trimmed.startsWith("+") || /^\d/.test(trimmed)) {
        newTrend = "up";
      }

      onUpdate({ 
        ...content, 
        value: newValue,
        trend: newTrend 
      });
    },
    [content, onUpdate, trend]
  );

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ ...content, label: e.target.value });
    },
    [content, onUpdate]
  );

  const handleTrendChange = (newTrend: "up" | "down" | "neutral") => {
    onUpdate({ ...content, trend: newTrend });
  };

  const handleTypeChange = (newType: "smooth" | "step" | "linear" | "bars") => {
    onUpdate({ ...content, sparklineType: newType });
  };

  // Determine chart color based on trend
  const chartColor = useMemo(() => {
    if (trend === "up") return "#22c55e"; // Green-500
    if (trend === "down") return "#ef4444"; // Red-500
    return theme.primary;
  }, [trend, theme.primary]);

  // Generate data based on trend
  const data = useMemo(() => {
    const points = 20;
    const result = [];
    let current = trend === "up" ? 20 : trend === "down" ? 80 : 50;

    for (let i = 0; i < points; i++) {
      const volatility = Math.random() * 20 - 10;
      const trendBias = trend === "up" ? 3 : trend === "down" ? -3 : 0;
      
      current = Math.max(0, Math.min(100, current + volatility + trendBias));
      result.push({ value: current });
    }
    return result;
  }, [trend]);

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 0, left: 0, bottom: 0 },
    };

    if (sparklineType === "bars") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            <Bar
              dataKey="value"
              fill={chartColor}
              opacity={0.6}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={`gradient-${block.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type={sparklineType === "linear" ? "linear" : sparklineType === "step" ? "step" : "monotone"}
            dataKey="value"
            stroke={chartColor}
            strokeWidth={3}
            fill={`url(#gradient-${block.id})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div
      className="group relative flex flex-col justify-between p-6 rounded-2xl h-full w-full overflow-hidden transition-all relative"
      style={{
        backgroundColor: withAlpha(theme.cardBackground, 0.6),
        border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
      }}
    >
      {/* Settings Popover */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: theme.headingColor }}
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 rounded-xl shadow-xl backdrop-blur-xl bg-white/90 dark:bg-black/90 border-0">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Trend Direction</label>
                <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                  {[
                    { val: "up", icon: TrendingUp },
                    { val: "neutral", icon: Minus },
                    { val: "down", icon: TrendingDown }
                  ].map(({ val, icon: Icon }) => (
                    <button
                      key={val}
                      onClick={() => handleTrendChange(val as any)}
                      className={`flex-1 p-2 rounded-md flex justify-center transition-all ${
                        trend === val ? "bg-white shadow-sm dark:bg-white/20" : "hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Chart Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {["smooth", "linear", "step", "bars"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type as any)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg capitalize border transition-all ${
                        sparklineType === type
                          ? `border-[${theme.primary}] bg-[${theme.primary}]/10 text-[${theme.primary}]`
                          : "border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10"
                      }`}
                      style={{
                        borderColor: sparklineType === type ? theme.primary : "transparent",
                        color: sparklineType === type ? theme.primary : "inherit"
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Background Pulse Glow - Removed for cleaner look */}

      <div className="relative z-10 flex flex-col gap-1 items-center justify-center text-center mt-2">
        <input
          value={value}
          onChange={handleValueChange}
          className="bg-transparent border-none outline-none text-5xl font-black text-center w-full"
          style={{
            fontFamily: "var(--font-heading)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.headingColor})`,
          }}
        />
        <input
          value={label}
          onChange={handleLabelChange}
          className="bg-transparent border-none outline-none text-sm font-medium text-center opacity-60 w-full uppercase tracking-wider"
          style={{ color: theme.headingColor }}
        />
      </div>

      {/* Interactive Chart Area */}
      <div className="relative z-10 h-16 w-full mt-6 opacity-80">
        {renderChart()}
      </div>
    </div>
  );
};
