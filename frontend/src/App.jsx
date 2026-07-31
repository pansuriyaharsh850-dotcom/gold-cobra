import React, { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import MapPanel from "./components/MapPanel";
import MilestoneTable from "./components/MilestoneTable";
import MilestoneCircleChart from "./components/MilestoneCircleChart";
import ResourcePieChart from "./components/ResourcePieChart";
import BomTable from "./components/BomTable";
import MaterialsTable from "./components/MaterialsTable";
import SummaryCard from "./components/SummaryCard";
import { authApi } from "./api/client";

const API = "https://gold-cobra.onrender.com/api";

// Only this role gets Add/Edit/Delete controls. Everyone else (client,
// viewer, or any other role your DB uses) gets a read-only dashboard.
const ADMIN_ROLE = "admin";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [selectedWard, setSelectedWard] = useState("");
  const [selectedRoad, setSelectedRoad] = useState("");

  const [milestoneData, setMilestoneData] = useState([]);
  const [bomData, setBomData] = useState([]);
  const [mixOverviewData, setMixOverviewData] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==========================
  // Check Login
  // ==========================
  useEffect(() => {
    const token = localStorage.getItem("gold_cobra_token");
    const storedRole = localStorage.getItem("gold_cobra_role");

    if (token) {
      setIsLoggedIn(true);
      setRole(storedRole);
    }
  }, []);

  // ==========================
  // Load Dashboard
  // ==========================
  useEffect(() => {
    if (isLoggedIn && selectedRoad) {
      loadDashboard();
    }
  }, [selectedRoad, isLoggedIn]);

  async function loadDashboard() {
    try {
      setLoading(true);

      const res = await fetch(
        `${API}/dashboard?road=${encodeURIComponent(selectedRoad)}`
      );

      const data = await res.json();

      setMilestoneData(data.milestones || []);
      setBomData(data.bom || []);
      setMixOverviewData(data.mixOverview || []);
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // Login
  // ==========================
  async function login(e) {
    e.preventDefault();

    if (!username || !password) return;

    setLoginError("");

    try {
      setLoggingIn(true);

      const res = await authApi.login({ username, password });
      const { token, user } = res.data;

      localStorage.setItem("gold_cobra_token", token);
      localStorage.setItem("gold_cobra_role", user?.role || "");

      setRole(user?.role || "");
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(
        err?.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  // ==========================
  // Logout
  // ==========================
  function logout() {
    localStorage.removeItem("gold_cobra_token");
    localStorage.removeItem("gold_cobra_role");
    setIsLoggedIn(false);
    setRole(null);
  }

  const canEdit = role === ADMIN_ROLE;

  if (!isLoggedIn) {
    return (
      <Login
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        onLogin={login}
        error={loginError}
        loading={loggingIn}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-100">

      <Navbar
        selectedWard={selectedWard}
        setSelectedWard={setSelectedWard}
        selectedRoad={selectedRoad}
        setSelectedRoad={setSelectedRoad}
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">

        {loading && (
          <div className="bg-white rounded-lg shadow p-4 text-blue-600 font-semibold">
            Loading Dashboard...
          </div>
        )}

        {!canEdit && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-4 py-2 text-sm font-medium">
            Viewing in read-only mode.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          <MapPanel
            selectedWard={selectedWard}
            selectedRoad={selectedRoad}
          />

          <SummaryCard
            selectedWard={selectedWard}
            selectedRoad={selectedRoad}
            milestones={milestoneData}
            bom={bomData}
            materials={mixOverviewData}
          />

        </div>

        <ResourcePieChart
          data={mixOverviewData}
        />

        <MaterialsTable
          data={mixOverviewData}
          road={selectedRoad}
          onChanged={loadDashboard}
          canEdit={canEdit}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          <MilestoneCircleChart
            data={milestoneData}
          />

          <MilestoneTable
            data={milestoneData}
            road={selectedRoad}
            onChanged={loadDashboard}
            canEdit={canEdit}
          />

        </div>

        <BomTable
          data={bomData}
          road={selectedRoad}
          onChanged={loadDashboard}
          canEdit={canEdit}
        />

      </main>

    </div>
  );
}
