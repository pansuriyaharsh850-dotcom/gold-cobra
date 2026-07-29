import React, { useEffect, useState } from "react";
import { Shield, LogOut, Menu, X } from "lucide-react";
import axios from "axios";

const API = "https://gold-cobra.onrender.com/api";

export default function Navbar({
  selectedWard,
  setSelectedWard,
  selectedRoad,
  setSelectedRoad,
  onLogout,
}) {
  const [wards, setWards] = useState([]);
  const [roads, setRoads] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const loadWards = async () => {
    try {
      const res = await axios.get(`${API}/wards`);

      setWards(res.data.wards || []);

      if (res.data.wards?.length > 0) {
        setSelectedWard(String(res.data.wards[0].ward_number));
      }
    } catch (err) {
      console.error("Load Wards Error:", err);
    }
  };

  const loadRoads = async (ward) => {
    try {
      const res = await axios.get(`${API}/roads/ward/${ward}`);

      setRoads(res.data.roads || []);

      if (res.data.roads?.length > 0) {
        setSelectedRoad(res.data.roads[0].road_name);
      }
    } catch (err) {
      console.error("Load Roads Error:", err);
    }
  };

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

        <div className="hidden lg:flex items-center gap-4">

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {wards.map((ward) => (
              <option key={ward.id} value={ward.ward_number}>
                Ward {ward.ward_number}
              </option>
            ))}
          </select>

          <select
            value={selectedRoad}
            onChange={(e) => setSelectedRoad(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {roads.map((road) => (
              <option key={road.id} value={road.road_name}>
                {road.road_name}
              </option>
            ))}
          </select>

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

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="border rounded-lg px-4 py-3"
          >
            {wards.map((ward) => (
              <option key={ward.id} value={ward.ward_number}>
                Ward {ward.ward_number}
              </option>
            ))}
          </select>

          <select
            value={selectedRoad}
            onChange={(e) => setSelectedRoad(e.target.value)}
            className="border rounded-lg px-4 py-3"
          >
            {roads.map((road) => (
              <option key={road.id} value={road.road_name}>
                {road.road_name}
              </option>
            ))}
          </select>

          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-3 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      )}

    </header>
  );
}
