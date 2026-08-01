import React, { useEffect, useState } from "react";
import { LogOut, Menu, X, Plus, Trash2 } from "lucide-react";
import axios from "axios";

import { wardApi, roadApi } from "../api/client";
import CrudModal from "./CrudModal";

const API = "https://gold-cobra.onrender.com/api";

const WARD_FIELDS = [
  {
    name: "ward_number",
    label: "Ward Number",
    type: "text",
    required: true,
  },
];

const ROAD_FIELDS = [
  {
    name: "road_name",
    label: "Road Name",
    type: "text",
    required: true,
  },
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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
    await wardApi.add({
      ward_number: values.ward_number,
    });

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
    const currentRoad = roads.find(
      (r) => r.road_name === selectedRoad
    );

    if (!currentRoad) return;

    if (
      !window.confirm(
        `Delete road "${selectedRoad}"?\n\nThis removes all its data.`
      )
    ) {
      return;
    }

    try {
      await roadApi.remove(currentRoad.id);
      await loadRoads(selectedWard);
    } catch (err) {
      window.alert(
        err?.response?.data?.message ||
          "Failed to delete road."
      );
    }
  }

  const wardControls = (mobile) => (
    <>
      <select
        value={selectedWard}
        onChange={(e) => setSelectedWard(e.target.value)}
        className={`h-10 border border-gray-300 rounded-lg px-4 bg-white ${
          mobile ? "w-full" : ""
        }`}
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
          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50"
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
        className={`h-10 border border-gray-300 rounded-lg px-4 bg-white ${
          mobile ? "w-full" : ""
        }`}
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
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50"
          >
            <Plus size={18} />
          </button>

          <button
            type="button"
            onClick={handleDeleteRoad}
            disabled={!selectedRoad}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 size={18} />
          </button>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">

          {/* Logo Container */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
  <img
    src="/logo.png"
    alt="Gold Cobra"
    className="h-16 w-auto object-contain"
  />
</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-3">

            {wardControls(false)}

            {roadControls(false)}

            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition"
            >
              <LogOut size={18} />
            </button>

          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg border"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-5 flex flex-col gap-3">

            <div className="flex gap-2">
              {wardControls(true)}
            </div>

            <div className="flex gap-2">
              {roadControls(true)}
            </div>

            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-3 flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        )}
      </header>

      {/* Ward Modal */}
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

      {/* Road Modal */}
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
    </>
  );
}