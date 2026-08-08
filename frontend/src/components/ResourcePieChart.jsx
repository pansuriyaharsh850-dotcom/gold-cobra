import React from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
} from "recharts";

import useMediaQuery from "../hooks/useMediaQuery";

const COLORS = [
  "#1E88E5",
  "#E5502A",
  "#D6A32C",
  "#455A64",
  "#26A374",
  "#9C5FE0",
  "#F2B705",
  "#3AA0C9",
];

function renderOuterLabel({ cx, cy, midAngle, outerRadius, percent, index }) {
  if (percent === 0) return null;
  const RAD = Math.PI / 180;
  const sin = Math.sin(-midAngle * RAD);
  const cos = Math.cos(-midAngle * RAD);
  const startX = cx + (outerRadius + 4) * cos;
  const startY = cy + (outerRadius + 4) * sin;
  const bendX = cx + (outerRadius + 16) * cos;
  const bendY = cy + (outerRadius + 16) * sin;
  const endX = bendX + (cos >= 0 ? 12 : -12);
  const color = COLORS[index % COLORS.length];

  return (
    <g>
      <path
        d={`M${startX},${startY}L${bendX},${bendY}L${endX},${bendY}`}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
      <text
        x={endX + (cos >= 0 ? 4 : -4)}
        y={bendY}
        textAnchor={cos >= 0 ? "start" : "end"}
        dominantBaseline="central"
        className="text-[11px] sm:text-xs font-mono font-semibold"
        fill={color}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    </g>
  );
}

function renderActiveShape(props) {
  const { outerRadius } = props;
  return <Sector {...props} outerRadius={outerRadius + 6} />;
}

export default function ResourcePieChart({ data = [] }) {
  const isCompact = useMediaQuery("(max-width: 639px)");
  const [activeIndex, setActiveIndex] = React.useState(null);

  const chartData = data.map((item) => ({
    ...item,
    value: Number(item.value || 0),
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const outerRadius = isCompact ? 82 : 118;
  const innerRadius = isCompact ? 54 : 78;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="bg-[#EFF4F8] p-2 rounded-lg shrink-0">
          <PieChartIcon className="text-[#2C5F8A]" size={22} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            TM Distribution
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Overview of available construction materials
          </p>
        </div>
      </div>

      <div
        className="h-px w-full my-4 sm:my-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, #D8DEE4 0, #D8DEE4 4px, transparent 4px, transparent 8px)",
        }}
      />

      {chartData.length === 0 ? (
        <div className="h-72 sm:h-96 md:h-[420px] flex items-center justify-center text-gray-500 text-center px-4">
          No material data available.
        </div>
      ) : (
        <>
          <div className="relative h-64 sm:h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={3}
                  label={renderOuterLabel}
                  labelLine={false}
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((item, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Quantity"]} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-mono font-bold text-gray-800 tabular-nums">
                  {total}
                </p>
                <p className="text-[10px] sm:text-xs tracking-widest uppercase text-gray-400 mt-0.5">
                  Total units
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 space-y-3">
            {chartData.map((item, index) => {
              const percent = total === 0 ? 0 : (item.value / total) * 100;
              const color = COLORS[index % COLORS.length];
              return (
                <div key={index}>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-sm sm:text-[15px] text-gray-800 truncate">
                      {item.name}
                    </span>
                    <span className="flex-1 border-b border-dotted border-gray-300 translate-y-[-3px]" />
                    <span className="font-mono text-sm text-gray-700 tabular-nums shrink-0">
                      {item.value}
                    </span>
                    <span className="font-mono text-xs text-gray-400 tabular-nums shrink-0 w-10 text-right">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
