import React, { useState } from "react";
import { PieChart } from "lucide-react";
import useMediaQuery from "../hooks/useMediaQuery";

const COLORS = [
  "#8B5A2B", // Brown
  "#16A34A", // Green
  "#A78BFA", // Lavender
  "#EAB308", // Gold
  "#FB7185", // Coral
  "#38BDF8", // Sky Blue
  "#2DD4BF", // Aqua
  "#EF29FF", // Magenta
  "#2563EB", // Blue
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#84CC16", // Lime
  "#94A3B8", // Slate Gray
];

// Helper to strip units like "325m" -> 325
function parseLength(val) {
  if (val == null) return 0;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

// Safely converts database values into valid percentages, ignoring "NaN" strings
function getValidPercentage(item) {
  const rawPct = item.percentage_completed ?? item.percentage;

  if (rawPct != null && rawPct !== "NaN" && !Number.isNaN(Number(rawPct))) {
    return parseLength(rawPct);
  }

  // Fallback: Compute percentage directly from total and achieved lengths
  const target = parseLength(item.target ?? item.totalLength ?? item.total_length);
  const achieved = parseLength(item.achieved ?? item.achievedLength ?? item.achieved_length);

  return target > 0 ? (achieved / target) * 100 : 0;
}

export default function MilestoneCircleChart({ data = [] }) {
  const isCompact = useMediaQuery("(max-width: 767px)");
  const [hoveredItem, setHoveredItem] = useState(null);

  const processedData = data.map((item, index) => {
    let percentage = getValidPercentage(item);
    percentage = Math.min(Math.max(percentage, 0), 100);

    const rawTarget = item.target ?? item.totalLength ?? item.total_length ?? "";
    const rawAchieved = item.achieved ?? item.achievedLength ?? item.achieved_length ?? "";

    return {
      id: item.id || index,
      name: item.name || item.milestoneName || item.milestone_name || `Milestone ${index + 1}`,
      percentage,
      displayTarget: rawTarget || parseLength(rawTarget),
      displayAchieved: rawAchieved || parseLength(rawAchieved),
      color: COLORS[index % COLORS.length],
    };
  });

  const overallAverage =
    processedData.length > 0
      ? (
          processedData.reduce((acc, curr) => acc + curr.percentage, 0) /
          processedData.length
        ).toFixed(0)
      : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <PieChart className="text-blue-600 shrink-0" size={20} />
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Project Progress Overview
        </h2>
      </div>

      {processedData.length === 0 ? (
        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 text-center px-4">
          No milestone data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center min-h-[320px]">
          {/* Circular Concentric Rings */}
          <div className="lg:col-span-7 flex justify-center items-center py-2">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {processedData.map((item, idx) => {
                  const strokeWidth = Math.max(2.2, Math.min(4, 32 / processedData.length));
                  const radius = 45 - idx * (strokeWidth + 1.2);
                  if (radius <= 5) return null;

                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset =
                    circumference - (item.percentage / 100) * circumference;

                  const isHovered = hoveredItem?.id === item.id;

                  return (
                    <g
                      key={item.id}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="cursor-pointer"
                    >
                      {/* Ring Track / Background */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                      />
                      {/* Ring Progress Fill */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                        opacity={hoveredItem && !isHovered ? 0.4 : 1}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Details */}
              <div className="absolute flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                <span className="text-2xl font-bold text-gray-800">
                  {hoveredItem
                    ? `${hoveredItem.percentage.toFixed(1)}%`
                    : `${overallAverage}%`}
                </span>
                <span className="text-xs text-gray-500 font-medium truncate max-w-[120px]">
                  {hoveredItem ? hoveredItem.name : "Overall"}
                </span>
                {hoveredItem && (
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {hoveredItem.displayAchieved} / {hoveredItem.displayTarget}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="lg:col-span-5 space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {processedData.map((item) => {
              const isHovered = hoveredItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center justify-between text-xs sm:text-sm p-1.5 rounded-md cursor-pointer transition-colors ${
                    isHovered ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 transition-transform"
                      style={{
                        backgroundColor: item.color,
                        transform: isHovered ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                    <span
                      className={`truncate ${
                        isHovered
                          ? "font-bold text-blue-700"
                          : "font-semibold text-gray-700"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 shrink-0">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}