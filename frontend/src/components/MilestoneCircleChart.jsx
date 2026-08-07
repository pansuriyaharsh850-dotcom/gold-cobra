import React from "react";
import { Clock } from "lucide-react";

const COLORS = [
  "#8B5A2B", // Brown
  "#16A34A", // Green
  "#A78BFA", // Lavender
  "#EAB308", // Gold
  "#FB7185", // Coral
  "#38BDF8", // Sky Blue
  "#2DD4BF", // Aqua
  "#EF29FF",// Purple
  "#2563EB", // Blue
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#84CC16", // Lime
  "#94A3B8", // Slate Gray
];

// Helper to extract numbers from strings like "325m" -> 325
function parseLength(val) {
  if (val == null) return 0;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

// Safely gets percentage even if DB contains "NaN"
function getValidPercentage(item) {
  const rawPct = item.percentage_completed ?? item.percentage;
  if (rawPct != null && rawPct !== "NaN" && !Number.isNaN(Number(rawPct))) {
    return parseLength(rawPct);
  }

  const target = parseLength(item.target ?? item.totalLength ?? item.total_length);
  const achieved = parseLength(item.achieved ?? item.achievedLength ?? item.achieved_length);

  return target > 0 ? (achieved / target) * 100 : 0;
}

export default function MilestoneCircleChart({ data = [] }) {
  const processedData = data.map((item, index) => {
    let percentage = getValidPercentage(item);
    percentage = Math.min(Math.max(percentage, 0), 100);

    return {
      id: item.id || index,
      name: item.name || item.milestoneName || item.milestone_name || `Item ${index + 1}`,
      percentage,
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full">
      {/* Title Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-indigo-600 shrink-0" size={20} />
        <h2 className="text-base sm:text-lg font-bold text-gray-800">
          Project Progress Overview
        </h2>
      </div>

      {processedData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No milestone data available.
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Concentric Circle Chart with On-Ring SVG Text */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {processedData.map((item, idx) => {
                const totalItems = processedData.length;
                const strokeWidth = Math.max(2.2, Math.min(3.8, 28 / totalItems));
                const radius = 45 - idx * (strokeWidth + 1.2);

                if (radius <= 6) return null;

                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset =
                  circumference - (item.percentage / 100) * circumference;

                return (
                  <g key={item.id}>
                    {/* Background Ring Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="#F3F4F6"
                      strokeWidth={strokeWidth}
                    />
                    {/* Colored Progress Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Black Percentage Label Centered Directly On Each Ring Level */}
                    <text
                      x="50"
                      y={50 - radius}
                      fill="#111827"
                      fontSize="2.8"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform="rotate(90 50 50)"
                      className="select-none"
                      stroke="#FFFFFF"
                      strokeWidth="0.3"
                      paintOrder="stroke fill"
                    >
                      {Math.round(item.percentage)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Grid Legend */}
          <div className="w-full mt-4 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-2 gap-x-2">
              {processedData.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-gray-600 font-medium truncate">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}