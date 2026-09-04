import React from "react";
import { CheckCircle, Layers, Map, Package } from "lucide-react";

export default function SummaryCard({ selectedWard, selectedRoad, milestones = [], materials = [] }) {
  const target = milestones.reduce((sum, item) => sum + Number(item.target || 0), 0);
  const achieved = milestones.reduce((sum, item) => sum + Number(item.achieved || 0), 0);
  const completion = target ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
  const stats = [
    ["Ward", selectedWard || "Not selected", Map, "bg-blue-100 text-blue-600"],
    ["Road", selectedRoad || "Not selected", Layers, "bg-green-100 text-green-600"],
    ["Materials", materials.length, Package, "bg-yellow-100 text-yellow-600"],
    ["Completion", `${completion}%`, CheckCircle, "bg-purple-100 text-purple-600"],
  ];
  return <section className="rounded-xl bg-white p-4 shadow-md sm:p-6"><h2 className="mb-4 text-lg font-bold text-gray-800 sm:mb-6 sm:text-xl">Project Summary</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-1 sm:gap-5">{stats.map(([label, value, Icon, color]) => <div key={label} className="flex min-w-0 items-center gap-3 sm:gap-4"><div className={`shrink-0 rounded-lg p-2.5 sm:p-3 ${color}`}><Icon size={20} /></div><div className="min-w-0"><p className="text-xs text-gray-500 sm:text-sm">{label}</p><p className="truncate text-sm font-semibold sm:text-base">{value}</p></div></div>)}</div><div className="mt-6 sm:mt-8"><div className="mb-2 flex justify-between text-sm sm:text-base"><span className="text-gray-600">Progress</span><strong>{completion}%</strong></div><div className="h-3 w-full rounded-full bg-gray-200"><div className="h-3 rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${completion}%` }} /></div></div></section>;
}
