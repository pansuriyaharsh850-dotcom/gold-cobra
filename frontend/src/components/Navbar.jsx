import React, { useEffect, useState } from "react";
import { Shield, LogOut, Menu, X, Plus, Trash2 } from "lucide-react";
import axios from "axios";

import { wardApi, roadApi } from "../api/client";
import CrudModal from "./CrudModal";

const API = "https://gold-cobra.onrender.com/api";

const WARD_FIELDS = [
  { name: "ward_number", label: "Ward Number", type: "text", required: true },
];

const ROAD_FIELDS = [
  { name: "road_name", label: "Road Name", type: "text", required: true },
];

export default function Navbar({
  selectedWard,
  setSelectedWard,
  selectedRoad,
  setSelectedRoad,
  onLogout,
  canEdit = false,
}) {
  const [wards, setWards] = useState([]);
  const [roads, setRoads] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [roadModalOpen, setRoadModalOpen] = useState(false);

  useEffect(() => {
    loadWards();
  }, []);

  useEffect(() => {
    if (selectedWard) {
      loadRoads(selectedWard);
    }
  }, [selectedWard]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadWards = async (preferWard) => {
    try {
      const res = await axios.get(`${API}/wards`);

      setWards(res.data.wards || []);

      if (preferWard) {
        setSelectedWard(String(preferWard));
      } else if (res.data.wards?.length > 0) {
        setSelectedWard(String(res.data.wards[0].ward_number));
      }
    } catch (err) {
      console.error("Load Wards Error:", err);
    }
  };

  const loadRoads = async (ward, preferRoad) => {
    try {
      const res = await axios.get(`${API}/roads/ward/${ward}`);

      setRoads(res.data.roads || []);

      if (preferRoad) {
        setSelectedRoad(preferRoad);
      } else if (res.data.roads?.length > 0) {
        setSelectedRoad(res.data.roads[0].road_name);
      }
    } catch (err) {
      console.error("Load Roads Error:", err);
    }
  };

  async function handleAddWard(values) {
    await wardApi.add({ ward_number: values.ward_number });
    setWardModalOpen(false);
    await loadWards(values.ward_number);
  }

  async function handleAddRoad(values) {
    const currentWard = wards.find(
      (w) => String(w.ward_number) === String(selectedWard)
    );

    if (!currentWard) {
      throw new Error("Select a ward first.");
    }

    await roadApi.add({
      ward_id: currentWard.id,
      road_name: values.road_name,
    });

    setRoadModalOpen(false);
    await loadRoads(selectedWard, values.road_name);
  }

  async function handleDeleteRoad() {
    const currentRoad = roads.find((r) => r.road_name === selectedRoad);
    if (!currentRoad) return;

    if (!window.confirm(`Delete road "${selectedRoad}"? This removes all its data.`)) {
      return;
    }

    try {
      await roadApi.remove(currentRoad.id);
      await loadRoads(selectedWard);
    } catch (err) {
      window.alert(err?.response?.data?.message || "Failed to delete road.");
    }
  }

  const wardControls = (mobile) => (
    <>
      <select
        value={selectedWard}
        onChange={(e) => setSelectedWard(e.target.value)}
        className={`border rounded-lg px-4 ${mobile ? "py-3" : "py-2"}`}
      >
        {wards.map((ward) => (
          <option key={ward.id} value={ward.ward_number}>
            Ward {ward.ward_number}
          </option>
        ))}
      </select>

      {canEdit && (
        <button
          type="button"
          onClick={() => setWardModalOpen(true)}
          title="Add Ward"
          className="border rounded-lg px-2.5 py-2 text-blue-600 hover:bg-blue-50 shrink-0"
        >
          <Plus size={18} />
        </button>
      )}
    </>
  );

  const roadControls = (mobile) => (
    <>
      <select
        value={selectedRoad}
        onChange={(e) => setSelectedRoad(e.target.value)}
        className={`border rounded-lg px-4 ${mobile ? "py-3" : "py-2"}`}
      >
        {roads.map((road) => (
          <option key={road.id} value={road.road_name}>
            {road.road_name}
          </option>
        ))}
      </select>

      {canEdit && (
        <>
          <button
            type="button"
            onClick={() => setRoadModalOpen(true)}
            title="Add Road"
            className="border rounded-lg px-2.5 py-2 text-blue-600 hover:bg-blue-50 shrink-0"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            onClick={handleDeleteRoad}
            disabled={!selectedRoad}
            title="Delete current road"
            className="border rounded-lg px-2.5 py-2 text-red-600 hover:bg-red-50 shrink-0 disabled:opacity-40"
          >
            <Trash2 size={18} />
          </button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md px-4 sm:px-6 lg:px-8 py-3 lg:py-4">

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-blue-600 p-2 sm:p-3 rounded-lg shrink-0">
            <Shield className="text-white" size={20} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 truncate">
              Gold Cobra
            </h1>

            <p className="hidden sm:block text-xs lg:text-sm text-gray-500">
              Road Infrastructure Management
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">

          {wardControls(false)}
          {roadControls(false)}

          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
          >
            <LogOut size={18} />
          </button>

        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden bg-blue-50 p-2 rounded-lg"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {isMenuOpen && (
        <div className="lg:hidden mt-4 flex flex-col gap-3">

          <div className="flex gap-2">{wardControls(true)}</div>
          <div className="flex gap-2">{roadControls(true)}</div>

          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-3 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      )}

      {canEdit && wardModalOpen && (
        <CrudModal
          title="Add Ward"
          fields={WARD_FIELDS}
          initialValues={{}}
          onClose={() => setWardModalOpen(false)}
          onSubmit={handleAddWard}
          submitLabel="Add"
        />
      )}

      {canEdit && roadModalOpen && (
        <CrudModal
          title={`Add Road (Ward ${selectedWard})`}
          fields={ROAD_FIELDS}
          initialValues={{}}
          onClose={() => setRoadModalOpen(false)}
          onSubmit={handleAddRoad}
          submitLabel="Add"
        />
      )}

    </header>
  );
}
