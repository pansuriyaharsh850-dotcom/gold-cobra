import React, { useState } from "react";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";

import { materialApi } from "../api/client";
import CrudModal from "./CrudModal";

const FIELDS = [
  { name: "mixType", label: "Mix Type", type: "text", required: true },
  { name: "itemType", label: "Item Type", type: "text", required: true },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "totalSum", label: "Total Sum", type: "number" },
];

export default function MaterialsTable({ data = [], road, onChanged, canEdit = true }) {

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function openAdd() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setModalOpen(true);
  }

  async function handleSubmit(values) {
    const payload = {
      mixType: values.mixType,
      itemType: values.itemType,
      quantity: values.quantity === "" ? null : Number(values.quantity),
      totalSum: values.totalSum === "" ? 0 : Number(values.totalSum),
    };

    if (editingItem) {
      await materialApi.update(editingItem.id, payload);
    } else {
      await materialApi.add({ road, ...payload });
    }

    setModalOpen(false);
    setEditingItem(null);
    onChanged && onChanged();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this material record?")) return;

    try {
      setDeletingId(id);
      await materialApi.remove(id);
      onChanged && onChanged();
    } catch (err) {
      console.error("Delete Material Error:", err);
      window.alert(err?.response?.data?.message || "Failed to delete material.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">

      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Package className="text-blue-600 shrink-0" size={20} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            TM 
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
            <span className="hidden sm:inline">Add Material</span>
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No material records found.
        </div>
      ) : (
        <>

          {/* Card list — phones only */}
          <div className="md:hidden space-y-3">
            {data.map((item) => (
              <div key={item.id} className="gc-mobile-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-700 truncate">
                      {item.mix_type} {item.item_type}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-gray-700 shrink-0">
                    {item.value}
                  </span>
                </div>

                {canEdit && (
                  <div className="flex justify-end gap-3 mt-3 border-t pt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Full table — tablet and up */}
          <div className="hidden md:block gc-table-scroll">
            <table className="min-w-[560px] w-full border border-gray-200 rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Mix Type</th>
                  <th className="px-4 py-3 text-left">Item Type</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  {canEdit && <th className="px-4 py-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-4 font-medium text-gray-700">
                      {item.mix_type}
                    </td>
                    <td className="px-4 py-4">{item.item_type}</td>
                    <td className="px-4 py-4 text-center">{item.value}</td>
                    {canEdit && (
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
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
          title={editingItem ? "Edit Material" : "Add Material"}
          fields={FIELDS}
          initialValues={
            editingItem
              ? {
                  mixType: editingItem.mix_type,
                  itemType: editingItem.item_type,
                  quantity: editingItem.value,
                }
              : {}
          }
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
          submitLabel={editingItem ? "Update" : "Add"}
        />
      )}

    </div>
  );
}
