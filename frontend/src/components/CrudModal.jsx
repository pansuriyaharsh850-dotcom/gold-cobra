import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * Generic add/edit form modal.
 *
 * fields: [{ name, label, type: "text"|"number"|"select", options?, required? }]
 */
export default function CrudModal({
  title,
  fields,
  initialValues = {},
  onClose,
  onSubmit,
  submitLabel = "Save",
}) {
  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((f) => {
      base[f.name] = initialValues[f.name] ?? "";
    });
    return base;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    for (const f of fields) {
      if (f.required && (values[f.name] === "" || values[f.name] == null)) {
        setError(`${f.label} is required.`);
        return;
      }
    }

    try {
      setSaving(true);
      await onSubmit(values);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {f.label}
                {f.required && <span className="text-red-500"> *</span>}
              </label>

              {f.type === "select" ? (
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={values[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  <option value="">Select...</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type || "text"}
                  className="w-full border rounded-lg px-3 py-2"
                  value={values[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  step={f.type === "number" ? "any" : undefined}
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
