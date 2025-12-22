import React, { useCallback, useMemo, memo } from "react";
import type { Block, Theme } from "@/types/presentation";
import { type PulseMetricContent } from "@/types/presentation";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconSettings, IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { CommonCard } from "../CommonCard";

// Type definitions for pulse metric options
type TrendType = "up" | "down" | "neutral";
type SparklineType = "smooth" | "step" | "linear" | "bars";

interface PulseMetricBlockProps {
  block: Block;
  onUpdate: (content: PulseMetricContent) => void;
  theme: Theme;
  readOnly?: boolean;
}

export const PulseMetricBlock = memo(function PulseMetricBlock({
  block,
  onUpdate,
  theme,
  readOnly = false,
}: PulseMetricBlockProps) {
  const content = block.content as PulseMetricContent;
  const { value, label, trend, sparklineType = "smooth" } = content;
  const isDark = theme.themeType === "dark";

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const newValue = e.target.value;
      const trimmed = newValue.trim();
      
      let newTrend = trend;
      if (trimmed.startsWith("-")) {
        newTrend = "down";
      } else if (trimmed.startsWith("+") || /^\d/.test(trimmed)) {
        newTrend = "up";
      }

      onUpdate({ ...content, value: newValue, trend: newTrend });
    },
    [content, onUpdate, trend, readOnly]
  );

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      onUpdate({ ...content, label: e.target.value });
    },
    [content, onUpdate, readOnly]
  );

  const handleTrendChange = useCallback((newTrend: TrendType) => {
    if (readOnly) return;
    onUpdate({ ...content, trend: newTrend });
  }, [content, onUpdate, readOnly]);

  const handleTypeChange = useCallback((newType: SparklineType) => {
    if (readOnly) return;
    onUpdate({ ...content, sparklineType: newType });
  }, [content, onUpdate, readOnly]);

  const chartColor = useMemo(() => {
    if (trend === "up") return "#22c55e";
    if (trend === "down") return "#ef4444";
    return theme.primary;
  }, [trend, theme.primary]);

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
              opacity={0.5}
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
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type={sparklineType === "linear" ? "linear" : sparklineType === "step" ? "step" : "monotone"}
            dataKey="value"
            stroke={chartColor}
            strokeWidth={2}
            fill={`url(#gradient-${block.id})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <CommonCard theme={theme} className="w-full h-full p-6">
      <div className="relative flex flex-col justify-between h-full w-full overflow-hidden transition-all">
        {/* Settings Popover - hidden in readOnly mode */}
        {!readOnly && (
          <div className="absolute top-0 right-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    color: theme.primary,
                  }}
                >
                  <IconSettings size={14} stroke={2} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-56 p-3 rounded-xl shadow-xl"
                style={{
                  backgroundColor: isDark ? "rgba(30,30,35,0.98)" : "rgba(255,255,255,0.98)",
                  backdropFilter: "blur(20px)",
                  border: "none",
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <label
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: isDark ? "#888" : "#666" }}
                    >
                      Trend
                    </label>
                    <div
                      className="flex gap-1 p-1 rounded-lg"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                    >
                      {[
                        { val: "up", icon: IconTrendingUp },
                        { val: "neutral", icon: IconMinus },
                        { val: "down", icon: IconTrendingDown }
                      ].map(({ val, icon: Icon }) => (
                        <button
                          key={val}
                          onClick={() => handleTrendChange(val as TrendType)}
                          className="flex-1 p-2 rounded-md flex justify-center transition-all"
                          style={{
                            backgroundColor: trend === val ? `${theme.primary}20` : "transparent",
                            color: trend === val ? theme.primary : (isDark ? "#888" : "#666"),
                          }}
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: isDark ? "#888" : "#666" }}
                    >
                      Style
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {["smooth", "linear", "step", "bars"].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type as SparklineType)}
                          className="px-2 py-1.5 text-[10px] font-medium rounded-lg capitalize transition-all"
                          style={{
                            backgroundColor: sparklineType === type ? `${theme.primary}20` : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                            color: sparklineType === type ? theme.primary : (isDark ? "#888" : "#666"),
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
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-1 items-center justify-center text-center mt-2">
          {readOnly ? (
            <>
              <div
                className="text-4xl font-bold text-center"
                style={{ color: theme.headingColor }}
              >
                {value}
              </div>
              <div
                className="text-xs font-medium text-center opacity-50 uppercase tracking-wider"
                style={{ color: theme.headingColor }}
              >
                {label}
              </div>
            </>
          ) : (
            <>
              <input
                value={value}
                onChange={handleValueChange}
                className="bg-transparent border-none outline-none text-4xl font-bold text-center w-full"
                style={{
                  color: theme.headingColor,
                }}
              />
              <input
                value={label}
                onChange={handleLabelChange}
                className="bg-transparent border-none outline-none text-xs font-medium text-center opacity-50 w-full uppercase tracking-wider"
                style={{ color: theme.headingColor }}
              />
            </>
          )}
        </div>

        {/* Chart */}
        <div className="relative z-10 h-14 w-full mt-4 opacity-70">
          {renderChart()}
        </div>
      </div>
    </CommonCard>
  );
});
