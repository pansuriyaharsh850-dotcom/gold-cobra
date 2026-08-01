import React, { useState } from "react";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";

import { milestoneApi } from "../api/client";
import CrudModal from "./CrudModal";

function getProgressColor(percentage) {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

const ADD_FIELDS = [
  { name: "name", label: "Milestone Name", type: "text", required: true },
  { name: "target", label: "Total Length", type: "number", required: true },
  { name: "achieved", label: "Achieved Length", type: "number", required: true },
];

const EDIT_FIELDS = [
  { name: "achieved", label: "Achieved Length", type: "number", required: true },
];

export default function MilestoneTable({ data = [], road, onChanged, canEdit = true }) {

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const rows = data.map((row, index) => {

    const target = Number(row.target || 0);
    const achieved = Number(row.achieved || 0);

    const percentage =
      row.percentage_completed !== undefined &&
      row.percentage_completed !== null
        ? Number(row.percentage_completed)
        : target > 0
        ? Number(((achieved / target) * 100).toFixed(2))
        : 0;

    return {
      key: row.id || index,
      id: row.id,
      index,
      name: row.name,
      target,
      achieved,
      percentage,
      progressColor: getProgressColor(percentage),
    };

  });

  function openAdd() {
    setEditingRow(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditingRow(row);
    setModalOpen(true);
  }

  async function handleSubmit(values) {
    if (editingRow) {
      await milestoneApi.update({
        road,
        milestoneName: editingRow.name,
        achievedLength: Number(values.achieved),
      });
    } else {
      await milestoneApi.add({
        road,
        milestoneName: values.name,
        totalLength: Number(values.target),
        achievedLength: Number(values.achieved),
      });
    }

    setModalOpen(false);
    setEditingRow(null);
    onChanged && onChanged();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this milestone?")) return;

    try {
      setDeletingId(id);
      await milestoneApi.remove(id);
      onChanged && onChanged();
    } catch (err) {
      console.error("Delete Milestone Error:", err);
      window.alert(err?.response?.data?.message || "Failed to delete milestone.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">

      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <Layers className="text-blue-600 shrink-0" size={20} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Project Milestones
          </h2>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openAdd}
            disabled={!road}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Milestone</span>
          </button>
        )}
      </div>

      {rows.length === 0 ? (

        <div className="text-center py-8 text-gray-500">
          No milestone data found.
        </div>

      ) : (

        <>

          {/* Card list — phones only */}
          <div className="md:hidden space-y-3">

            {rows.map((row) => (

              <div key={row.key} className="gc-mobile-card">

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                      {row.index + 1}
                    </span>
                    <span className="font-semibold text-gray-700 truncate">
                      {row.name}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-gray-700 shrink-0">
                    {row.percentage.toFixed(1)}%
                  </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className={`${row.progressColor} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(row.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Total Work: {row.target}</span>
                  <span className="text-green-600 font-semibold">
                    Actual Work: {row.achieved}
                  </span>
                </div>

                {canEdit && (
                  <div className="flex justify-end gap-3 mt-3 border-t pt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      disabled={deletingId === row.id}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingId === row.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}

              </div>

            ))}

          </div>

          {/* Full table — tablet and up */}
          <div className="hidden md:block gc-table-scroll">

            <table className="w-full min-w-[640px] border-collapse">

              <thead>

                <tr className="bg-blue-600 text-white">

                  <th className="px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3 text-left">Milestone</th>
                  <th className="px-4 py-3 text-center">Total Work</th>
                  <th className="px-4 py-3 text-center">Actual Work</th>
                  <th className="px-4 py-3 text-center min-w-[180px]">Progress</th>
                  {canEdit && <th className="px-4 py-3 text-center">Actions</th>}

                </tr>

              </thead>

              <tbody>

                {rows.map((row) => (

                  <tr
                    key={row.key}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    <td className="px-4 py-4 text-center font-semibold">
                      {row.index + 1}
                    </td>

                    <td className="px-4 py-4 font-semibold text-gray-700">
                      {row.name}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {row.target}m
                    </td>

                    <td className="px-4 py-4 text-center text-green-600 font-bold">
                      {row.achieved}m
                    </td>

                    <td className="px-4 py-4">

                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${row.progressColor} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(row.percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>{row.achieved} / {row.target}</span>
                        <span className="font-semibold">
                          {row.percentage.toFixed(2)}%
                        </span>
                      </div>

                    </td>

                    {canEdit && (
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            disabled={deletingId === row.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </>

      )}

      {canEdit && modalOpen && (
        <CrudModal
          title={editingRow ? `Edit "${editingRow.name}"` : "Add Milestone"}
          fields={editingRow ? EDIT_FIELDS : ADD_FIELDS}
          initialValues={editingRow ? { achieved: editingRow.achieved } : {}}
          onClose={() => {
            setModalOpen(false);
            setEditingRow(null);
          }}
          onSubmit={handleSubmit}
          submitLabel={editingRow ? "Update" : "Add"}
        />
      )}

    </div>
  );
}
