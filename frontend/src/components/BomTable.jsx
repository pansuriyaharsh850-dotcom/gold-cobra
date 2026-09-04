import React, { useState } from "react";
import { HardHat, Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { bomApi } from "../api/client";
import CrudModal from "./CrudModal";

const STATUS_OPTIONS = ["Problem", "Good"];

const FIELDS = [
  { name: "item", label: "Item", type: "text", required: true },
  { name: "type", label: "Category", type: "text" },
  { name: "specs", label: "Technical Specifications", type: "text" },
  { name: "qty", label: "Quantity", type: "number", required: true },
  { name: "unit", label: "Unit", type: "text" },
  { name: "unitRate", label: "Unit Rate", type: "number" },
  { name: "totalCost", label: "Total Cost (auto)", type: "number" },
  { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
];

const MAX_PLATE_LENGTH = 500;

function normaliseNumberPlates(value) {
  return value
    .split(/[\n,]/)
    .map((plate) => plate.trim().toUpperCase())
    .filter(Boolean);
}

export default function BomTable({ data = [], road, onChanged, canEdit = true }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // New Log Form State — includes count and number plate
  const [formData, setFormData] = useState({
    date: "",
    count: "1",
    quantity: "",
    unitRate: "",
    numberPlate: "",
  });

  function openAdd() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingItem({ ...item, unitRate: item.unit_rate });
    setModalOpen(true);
  }

  async function handleSubmit(values) {
    const qty = values.qty === "" ? 0 : Number(values.qty);
    const unitRate = values.unitRate === "" ? 0 : Number(values.unitRate);

    const computedTotal =
      unitRate > 0
        ? qty * unitRate
        : values.totalCost === ""
        ? 0
        : Number(values.totalCost);

    const payload = {
      item: values.item,
      type: values.type,
      specs: values.specs,
      qty: values.qty === "" ? null : qty,
      unit: values.unit,
      unitRate,
      totalCost: computedTotal,
      status: values.status,
    };

    try {
      if (editingItem) {
        await bomApi.update(editingItem.id, payload);
      } else {
        await bomApi.add({ road, ...payload });
      }

      setModalOpen(false);
      setEditingItem(null);
      if (onChanged) onChanged();
    } catch (err) {
      console.error("Save BOM Error:", err);
      alert(err?.response?.data?.message || "Failed to save BOM item.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this BOM item?")) return;

    try {
      setDeletingId(id);
      await bomApi.remove(id);
      if (onChanged) onChanged();
    } catch (err) {
      console.error("Delete BOM Error:", err);
      window.alert(err?.response?.data?.message || "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function openLogModal(item) {
    setSelectedItem(item);
    setFormData({ date: "", count: "1", quantity: "", unitRate: item.unit_rate || "", numberPlate: "" });
    setLogModalOpen(true);
    setLoadingLogs(true);

    try {
      const res = await bomApi.getById(item.id);
      if (res.data?.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load detailed logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }

  function closeLogModal() {
    setLogModalOpen(false);
    setSelectedItem(null);
    setLogs([]);
  }

  const handleAddLogEntry = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const numberPlates = normaliseNumberPlates(formData.numberPlate);

    try {
      const payload = {
        date: formData.date,
        count: numberPlates.length || (formData.count === "" ? 1 : Number(formData.count)),
        qty: Number(formData.quantity),
        unitRate: formData.unitRate ? Number(formData.unitRate) : selectedItem.unit_rate || 0,
        numberPlate: numberPlates.join(", ") || null,
      };

      const res = await bomApi.addLog(selectedItem.id, payload);

      if (res.data?.success) {
        setLogs((prev) => [res.data.log, ...prev]);
        setFormData({
          date: "",
          count: "1",
          quantity: "",
          unitRate: selectedItem.unit_rate || "",
          numberPlate: "",
        });

        if (onChanged) onChanged();
      } else {
        alert(res.data?.message || "Failed to add log entry.");
      }
    } catch (err) {
      console.error("Failed to save log entry:", err);
      alert(err?.response?.data?.message || "Failed to save log entry.");
    }
  };

  const handleDeleteLogEntry = async (logId) => {
    if (!window.confirm("Delete this log entry?")) return;

    try {
      const res = await bomApi.deleteLog(logId);

      if (res.data?.success) {
        setLogs((prev) => prev.filter((log) => log.id !== logId));
        if (onChanged) onChanged();
      } else {
        alert(res.data?.message || "Failed to delete log entry.");
      }
    } catch (err) {
      console.error("Failed to delete log entry:", err);
      alert(err?.response?.data?.message || "Failed to delete log entry.");
    }
  };

  const previewCount = formData.count === "" ? 1 : Number(formData.count) || 0;
  const previewQty = Number(formData.quantity) || 0;
  const previewRate = formData.unitRate ? Number(formData.unitRate) : (selectedItem?.unit_rate || 0);
  const previewCost = previewCount * previewQty * previewRate;

  const totalLogQty = logs.reduce((acc, curr) => acc + Number(curr.qty || 0) * Number(curr.count || 1), 0);
  const totalLogCost = logs.reduce((acc, curr) => acc + Number(curr.totalCost || (curr.qty * curr.unitRate * (curr.count || 1)) || 0), 0);

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
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

      {data.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No material records found.
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {data.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 shadow-sm bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button
                      type="button"
                      onClick={() => openLogModal(item)}
                      className="font-semibold text-blue-600 hover:underline text-left block"
                    >
                      {item.item}
                    </button>
                    <p className="text-xs text-gray-500 mt-0.5">{item.type}</p>
                  </div>

                </div>

                <div className="flex justify-between text-sm text-gray-600 mt-3 border-t pt-2">
                  <span>Quantity</span>
                  <span className="font-semibold text-gray-800">
                    {item.qty} {item.unit}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-3 border-t pt-2">
                  <button
                    type="button"
                    onClick={() => openLogModal(item)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <Eye size={14} /> View Logs
                  </button>

                  {canEdit && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(item)} className="text-blue-600">
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[900px] w-full border border-gray-200 rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Specifications</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3 text-center">Unit</th>
                  <th className="px-4 py-3 text-center">Unit Rate</th>
                  <th className="px-4 py-3 text-center">Total Cost</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-4 font-semibold text-blue-600">
                      <button
                        type="button"
                        onClick={() => openLogModal(item)}
                        className="hover:underline text-left"
                      >
                        {item.item}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{item.type}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{item.specs}</td>
                    <td className="px-4 py-4 text-center">{item.qty}</td>
                    <td className="px-4 py-4 text-center">{item.unit}</td>
                    <td className="px-4 py-4 text-center">
                      ₹{Number(item.unit_rate || item.unitRate || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold">
                      ₹{Number(item.total_cost || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => openLogModal(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Logs"
                        >
                          <Eye size={16} />
                        </button>
                        {canEdit && (
                          <>
                            <button type="button" onClick={() => openEdit(item)} className="text-blue-600">
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="text-red-600 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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

      {logModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 text-white p-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {selectedItem.item} — Detailed Log Record
                </h3>
                <p className="text-xs text-blue-100 mt-1">
                  Category: {selectedItem.type || "N/A"} | Unit: {selectedItem.unit || "N/A"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeLogModal}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-blue-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {canEdit && (
                <form
                  onSubmit={handleAddLogEntry}
                  className="bg-gray-50 border rounded-xl p-4 space-y-3"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        No. of {selectedItem.item}
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="e.g. 3"
                        value={formData.count}
                        onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Number Plates
                      </label>
                      <textarea
                        rows={1}
                        maxLength={MAX_PLATE_LENGTH}
                        placeholder="GJ-05-AB-1234, GJ-11-EA-5351"
                        value={formData.numberPlate}
                        onChange={(e) => {
                          const numberPlate = e.target.value;
                          const numberPlates = normaliseNumberPlates(numberPlate);
                          setFormData({
                            ...formData,
                            numberPlate,
                            count: numberPlates.length ? String(numberPlates.length) : formData.count,
                          });
                        }}
                        className="w-full resize-y border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Quantity ({selectedItem.unit || "units"})
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="e.g. 10"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Unit Rate (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder={selectedItem.unit_rate || "0"}
                        value={formData.unitRate}
                        onChange={(e) => setFormData({ ...formData, unitRate: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition h-10"
                    >
                      Add Entry
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    {previewCount} × {previewQty} {selectedItem.unit} × ₹{previewRate} ={" "}
                    <strong className="text-gray-800">₹{previewCost.toLocaleString()}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Add multiple plates with a comma or on separate lines. Unit count updates automatically.
                  </p>
                </form>
              )}

              <div className="border rounded-xl overflow-x-auto max-h-[300px]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gray-100 sticky top-0 border-b">
                    <tr>
                      <th className="p-3 text-center">Sr No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">No. of Units</th>
                      <th className="p-3">Number Plate</th>
                      <th className="p-3 text-center">Quantity ({selectedItem.unit})</th>
                      <th className="p-3 text-center">Unit Rate</th>
                      <th className="p-3 text-center">Total Cost</th>
                      {canEdit && <th className="p-3 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={canEdit ? 9 : 8} className="text-center py-6 text-gray-500">
                          Loading logs...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={canEdit ? 9 : 8} className="text-center py-6 text-gray-400">
                          No daily log records added yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, index) => {
                        const count = Number(log.count || 1);
                        const cost = log.totalCost ?? log.qty * log.unitRate * count;
                        return (
                          <tr key={log.id || index} className="hover:bg-gray-50">
                            <td className="p-3 text-center font-medium text-gray-500">{index + 1}</td>
                            <td className="p-3 text-gray-800">
                              {new Date(log.date).toISOString().split("T")[0]}
                            </td>
                            <td className="p-3 text-gray-700 font-medium">{selectedItem.item}</td>
                            <td className="p-3 text-center font-semibold">{count}</td>
                            <td className="p-3 text-gray-700">{log.numberPlate || "-"}</td>
                            <td className="p-3 text-center font-semibold">
                              {log.qty} {selectedItem.unit}
                            </td>
                            <td className="p-3 text-center text-gray-600">
                              ₹{Number(log.unitRate || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-center font-bold text-gray-900">
                              ₹{Number(cost || 0).toLocaleString()}
                            </td>
                            {canEdit && (
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLogEntry(log.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between border-t pt-4 text-xs sm:text-sm font-semibold text-gray-700 gap-2">
                <div>Total Logs: {logs.length}</div>
                <div className="flex gap-4">
                  <span>
                    Total Qty: <strong className="text-blue-600">{totalLogQty} {selectedItem.unit}</strong>
                  </span>
                  <span>
                    Total Cost: <strong className="text-green-600">₹{totalLogCost.toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
