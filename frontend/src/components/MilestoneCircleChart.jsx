import React from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  Cell,
} from "recharts";

import { PieChart } from "lucide-react";
import useMediaQuery from "../hooks/useMediaQuery";

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16", // lime
];

export default function MilestoneCircleChart({ data }) {

  const isCompact = useMediaQuery("(max-width: 767px)");

  const chartData = data.map((item, index) => ({
    name: item.name,
    value:
      item.percentage_completed ??
      (item.target > 0
        ? (item.achieved / item.target) * 100
        : 0),
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">

      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <PieChart className="text-blue-600 shrink-0" size={20} />
        <h2 className="text-lg sm:text-xl font-bold">
          Project Progress Overview
        </h2>
      </div>

      {chartData.length === 0 ? (

        <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 text-center px-4">
          No milestone data available.
        </div>

      ) : (

        <div className="h-80 sm:h-96">

          <ResponsiveContainer width="100%" height="100%">

            <RadialBarChart
              innerRadius="15%"
              outerRadius="90%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
              margin={
                isCompact
                  ? { top: 0, right: 10, bottom: 0, left: 10 }
                  : { top: 0, right: 20, bottom: 0, left: 20 }
              }
            >

              <RadialBar
                dataKey="value"
                background
                label={{
                  fill: "#333",
                  position: "insideStart",
                  fontSize: isCompact ? 9 : 11,
                }}
              >
                {chartData.map((entry, index) => (
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

              <Tooltip />

            </RadialBarChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  );
}