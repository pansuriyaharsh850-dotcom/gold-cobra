import React, { useRef, useState } from "react";
import { MapPin, Pencil, Upload, X } from "lucide-react";

import { roadApi } from "../api/client";

// Keep uploaded images reasonably small since they're stored as base64
// text directly in the database (no external file storage configured).
const MAX_FILE_MB = 2;

export default function MapPanel({
  selectedWard,
  selectedRoad,
  imageUrl,
  onChanged,
  canEdit = false,
}) {
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(imageUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  function openEditor() {
    setPreview(imageUrl || "");
    setError("");
    setEditing(true);
  }

  function handleFilePicked(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Image is too large — please pick one under ${MAX_FILE_MB}MB.`);
      return;
    }

    setError("");

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!preview) {
      setError("Choose a photo first.");
      return;
    }

    setError("");
    try {
      setSaving(true);
      await roadApi.setImage({ road: selectedRoad, imageUrl: preview });
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
            {imageUrl ? "Change Photo" : "Add Photo"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex-1 min-h-[220px] sm:min-h-[280px] rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center px-4 gap-3">

          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 rounded-lg object-cover"
            />
          ) : (
            <Upload className="text-gray-300" size={36} />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFilePicked}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium"
          >
            Choose Photo From Device
          </button>

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
              disabled={saving || !preview}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : imageUrl ? (
        <button
          type="button"
          onClick={() => setFullscreenOpen(true)}
          className="flex-1 min-h-[220px] sm:min-h-[280px] rounded-lg overflow-hidden bg-gray-100 relative text-left cursor-zoom-in group"
        >
          <img
            src={imageUrl}
            alt={selectedRoad}
            className="w-full h-full object-cover group-hover:opacity-90 transition"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-3 py-2">
            <p className="font-semibold">{selectedRoad}</p>
            <p className="text-xs text-gray-200">Ward {selectedWard}</p>
          </div>
        </button>
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
              ? "No photo yet — click \"Add Photo\" above to upload one from your device."
              : "No photo available for this road yet."}
          </p>
        </div>
      )}

      {fullscreenOpen && imageUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreenOpen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreenOpen(false)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <X size={24} />
          </button>

          <img
            src={imageUrl}
            alt={selectedRoad}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-0 right-0 text-center text-white">
            <p className="font-semibold text-lg">{selectedRoad}</p>
            <p className="text-sm text-gray-300">Ward {selectedWard}</p>
          </div>
        </div>
      )}

    </div>
  );
}
