import React from "react";
import { MapPin } from "lucide-react";

export default function MapPanel({ selectedWard, selectedRoad }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col">

      <div className="flex items-center gap-2 mb-4">
        <MapPin className="text-blue-600 shrink-0" size={20} />
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          Location
        </h2>
      </div>

      <div className="flex-1 min-h-[220px] sm:min-h-[280px] rounded-lg bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center px-4">
        <MapPin className="text-gray-300 mb-2" size={40} />
        <p className="font-semibold text-gray-600">
          {selectedRoad || "No road selected"}
        </p>
        <p className="text-sm text-gray-400">
          {selectedWard ? `Ward ${selectedWard}` : ""}
        </p>
        <p className="text-xs text-gray-400 mt-2 max-w-xs">
          Map view placeholder — wire up your Google Maps / Leaflet integration here.
        </p>
      </div>

    </div>
  );
}
