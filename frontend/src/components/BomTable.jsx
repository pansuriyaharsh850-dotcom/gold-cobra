import React, { useState } from "react";
import { HardHat, Plus, Pencil, Trash2 } from "lucide-react";

import { bomApi } from "../api/client";
import CrudModal from "./CrudModal";

const STATUS_OPTIONS = ["Pending", "In Transit", "Delivered"];

const FIELDS = [
  { name: "item", label: "Item", type: "text", required: true },
  { name: "type", label: "Category", type: "text" },
  { name: "qty", label: "Quantity", type: "number", required: true },
  { name: "unit", label: "Unit", type: "text" },
  { name: "totalCost", label: "Total Cost", type: "number" },
  { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
];

export default function BomTable({ data = [], road, onChanged, canEdit = true }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getStatusStyle = (status) => {
    if (!status) {
      return "bg-gray-100 text-gray-700";
    }

    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "in transit":
        return "bg-yellow-100 text-yellow-700";

      case "pending":
        return "bg-red-100 text-red-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

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
      item: values.item,
      type: values.type,
      qty: values.qty === "" ? null : Number(values.qty),
      unit: values.unit,
      totalCost: values.totalCost === "" ? 0 : Number(values.totalCost),
      status: values.status,
    };

    if (editingItem) {
      await bomApi.update(editingItem.id, payload);
    } else {
      await bomApi.add({ road, ...payload });
    }

    setModalOpen(false);
    setEditingItem(null);
    onChanged && onChanged();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this BOM item?")) return;

    try {
      setDeletingId(id);
      await bomApi.remove(id);
      onChanged && onChanged();
    } catch (err) {
      console.error("Delete BOM Error:", err);
      window.alert(err?.response?.data?.message || "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <HardHat className="text-blue-600 shrink-0" size={22} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Bill of Materials
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
            <span className="hidden sm:inline">Add Item</span>
          </button>
        )}
      </div>

      {/* Empty State */}
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
                      {item.item}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.type}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>

                </div>

                <div className="flex justify-between text-sm text-gray-600 mt-3 border-t pt-3">
                  <span>Quantity</span>
                  <span className="font-semibold text-gray-800">
                    {item.qty} {item.unit}
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

            <table className="min-w-[640px] w-full border border-gray-200 rounded-lg">

              <thead className="bg-blue-600 text-white">

                <tr>

                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3 text-center">Unit</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {canEdit && <th className="px-4 py-3 text-center">Actions</th>}

                </tr>

              </thead>

              <tbody>

                {data.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    <td className="px-4 py-4 font-medium text-gray-700">
                      {item.item}
                    </td>

                    <td className="px-4 py-4">
                      {item.type}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {item.qty}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {item.unit}
                    </td>

                    <td className="px-4 py-4 text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                    </td>

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
          title={editingItem ? "Edit BOM Item" : "Add BOM Item"}
          fields={FIELDS}
          initialValues={editingItem || {}}
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
