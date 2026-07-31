import React, { useState } from "react";
import { MapPin, Pencil } from "lucide-react";

import { roadApi } from "../api/client";

export default function MapPanel({
  selectedWard,
  selectedRoad,
  imageUrl,
  onChanged,
  canEdit = false,
}) {
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(imageUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openEditor() {
    setUrlInput(imageUrl || "");
    setError("");
    setEditing(true);
  }

  async function handleSave() {
    setError("");
    try {
      setSaving(true);
      await roadApi.setImage({ road: selectedRoad, imageUrl: urlInput });
      setEditing(false);
      onChanged && onChanged();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save image.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col">

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-600 shrink-0" size={20} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Location
          </h2>
        </div>

        {canEdit && selectedRoad && !editing && (
          <button
            type="button"
            onClick={openEditor}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <Pencil size={14} />
            {imageUrl ? "Change Image" : "Set Image"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex-1 min-h-[220px] sm:min-h-[280px] rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center px-4 gap-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm"
          />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : imageUrl ? (
        <div className="flex-1 min-h-[220px] sm:min-h-[280px] rounded-lg overflow-hidden bg-gray-100 relative">
          <img
            src={imageUrl}
            alt={selectedRoad}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-3 py-2">
            <p className="font-semibold">{selectedRoad}</p>
            <p className="text-xs text-gray-200">Ward {selectedWard}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[220px] sm:min-h-[280px] rounded-lg bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center px-4">
          <MapPin className="text-gray-300 mb-2" size={40} />
          <p className="font-semibold text-gray-600">
            {selectedRoad || "No road selected"}
          </p>
          <p className="text-sm text-gray-400">
            {selectedWard ? `Ward ${selectedWard}` : ""}
          </p>
          <p className="text-xs text-gray-400 mt-2 max-w-xs">
            {canEdit
              ? "No image set yet — click \"Set Image\" above to add one."
              : "No image available for this road yet."}
          </p>
        </div>
      )}

    </div>
  );
}
