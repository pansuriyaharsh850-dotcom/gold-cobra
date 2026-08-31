import React, { useState } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Legend,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { PieChart, BarChart as BarChartIcon } from "lucide-react";
import useMediaQuery from "../hooks/useMediaQuery";

const RING_COLORS = [
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

function parseLength(val) {
  if (val == null) return 0;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

export default function MilestoneCircleChart({ data = [] }) {
  const isCompact = useMediaQuery("(max-width: 767px)");

  // "circle" is the default view; "bar" is the alternate.
  const [chartType, setChartType] = useState("circle");

  // ---------- Data for the Circle (Radial) view ----------
  const circleData = data.map((item, index) => {
    const percent =
      item.percentage_completed ??
      (item.target > 0 ? (item.achieved / item.target) * 100 : 0);

    return {
      name: item.name,
      // Clamp to a tiny minimum so a 0% milestone still shows a sliver
      // on the ring instead of vanishing completely.
      value: Math.max(Number(percent) || 0, 1),
      fill: RING_COLORS[index % RING_COLORS.length],
    };
  });

  // ---------- Data for the Bar (Total vs Achieved) view ----------
  const barData = data.map((item, index) => {
    const target = parseLength(item.target ?? item.totalLength ?? item.total_length);
    const achieved = parseLength(item.achieved ?? item.achievedLength ?? item.achieved_length);
    const fullName = item.name || item.milestoneName || item.milestone_name || `Milestone ${index + 1}`;

    return {
      fullName,
      shortName: fullName.length > 8 ? `${fullName.slice(0, 7)}…` : fullName,
      Total: target,
      Achieved: achieved,
      targetLabel: item.target_label || (target ? `${target}m` : "0m"),
      achievedLabel: item.achieved_label || (achieved ? `${achieved}m` : "0m"),
    };
  });

  const minBarWidth = Math.max(barData.length * 55, 320);
  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">

      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 min-w-0">
          {chartType === "circle" ? (
            <PieChart className="text-blue-600 shrink-0" size={20} />
          ) : (
            <BarChartIcon className="text-blue-600 shrink-0" size={20} />
          )}
          <h2 className="text-lg sm:text-xl font-bold truncate">
            Project Progress Overview
          </h2>
        </div>

        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border rounded-lg px-2.5 py-1.5 text-sm text-gray-700 bg-white shrink-0"
        >
          <option value="circle">Circle View</option>
          <option value="bar">Bar View</option>
        </select>
      </div>

      {isEmpty ? (

        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 text-center px-4">
          No milestone data available.
        </div>

      ) : chartType === "circle" ? (

        <div className="h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="15%"
              outerRadius="90%"
              data={circleData}
              startAngle={90}
              endAngle={-270}
              margin={
                isCompact
                  ? { top: 0, right: 10, bottom: 0, left: 10 }
                  : { top: 0, right: 20, bottom: 0, left: 20 }
              }
            >
              {/* Without this, Recharts scales the ring to the data's own
                  max value instead of 0-100, so bars always render as a
                  full circle no matter the real percentage. */}
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />

              <RadialBar
                dataKey="value"
                background
                label={{
                  fill: "#333",
                  position: "insideStart",
                  fontSize: isCompact ? 9 : 11,
                  formatter: (value) => `${Number(value).toFixed(0)}%`,
                }}
              >
                {circleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RadialBar>

              <Legend
                iconSize={10}
                layout={isCompact ? "horizontal" : "vertical"}
                verticalAlign={isCompact ? "bottom" : "middle"}
                align={isCompact ? "center" : "right"}
                wrapperStyle={
                  isCompact
                    ? { fontSize: 11, lineHeight: "1.4rem" }
                    : { fontSize: 13 }
                }
              />

              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, "Completed"]}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

      ) : (

        <div className="w-full overflow-x-auto pb-2">
          <div style={{ width: "100%", minWidth: `${minBarWidth}px`, height: "320px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: "#4B5563", fontSize: 11 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  dx={-2}
                  dy={5}
                />
                <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E7EB",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(value, items) => {
                    if (items && items[0]) {
                      return items[0].payload.fullName;
                    }
                    return value;
                  }}
                  formatter={(value, name, props) => {
                    const isTotal = name === "Total" || name === "Total Length";
                    const label = isTotal ? props.payload.targetLabel : props.payload.achievedLabel;
                    return [label, name];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
                />
                <Bar dataKey="Total" name="Total Length" fill="#93C5FD" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Achieved" name="Achieved Length" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      )}

    </div>
  );
}
