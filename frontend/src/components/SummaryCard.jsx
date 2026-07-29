import React from "react";
import {
  Map,
  Layers,
  Package,
  CheckCircle,
} from "lucide-react";

export default function SummaryCard({
  selectedWard,
  selectedRoad,
  milestones = [],
  bom = [],
  materials = [],
}) {

  const totalTarget = milestones.reduce(
    (sum, item) => sum + Number(item.target || 0),
    0
  );

  const totalAchieved = milestones.reduce(
    (sum, item) => sum + Number(item.achieved || 0),
    0
  );

  const completion =
    totalTarget > 0
      ? Math.round((totalAchieved / totalTarget) * 100)
      : 0;

  const stats = [
    {
      label: "Ward",
      value: selectedWard,
      icon: Map,
      bg: "bg-blue-100",
      fg: "text-blue-600",
    },
    {
      label: "Road",
      value: selectedRoad,
      icon: Layers,
      bg: "bg-green-100",
      fg: "text-green-600",
    },
    {
      label: "Materials",
      value: materials.length,
      icon: Package,
      bg: "bg-yellow-100",
      fg: "text-yellow-600",
    },
    {
      label: "Completion",
      value: `${completion}%`,
      icon: CheckCircle,
      bg: "bg-purple-100",
      fg: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">

      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
        Project Summary
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-5">

        {stats.map(({ label, value, icon: Icon, bg, fg }) => (

          <div key={label} className="flex items-center gap-3 sm:gap-4 min-w-0">

            <div className={`${bg} p-2.5 sm:p-3 rounded-lg shrink-0`}>
              <Icon className={fg} size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-gray-500 text-xs sm:text-sm">
                {label}
              </p>

              <h3 className="font-semibold text-sm sm:text-base truncate">
                {value}
              </h3>
            </div>

          </div>

        ))}

      </div>

      <div className="mt-6 sm:mt-8">

        <div className="flex justify-between mb-2 text-sm sm:text-base">

          <span className="text-gray-600">
            Progress
          </span>

          <span className="font-bold">
            {completion}%
          </span>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${completion}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}
