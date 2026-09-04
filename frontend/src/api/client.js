import axios from "axios";

const API = "https://gold-cobra.onrender.com/api";

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("gold_cobra_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==============================================
// Dashboard API
// ==============================================
export const dashboardApi = {
  getDashboard: (road) => client.get(`/dashboard?road=${encodeURIComponent(road)}`),
  updateMilestone: (payload) => client.put("/dashboard/update-milestone", payload),
};

// ==============================================
// Auth API
// ==============================================
export const authApi = {
  login: (payload) => client.post("/auth/login", payload),
};

// ==============================================
// Bill of Materials
// ==============================================
export const bomApi = {
  add: (payload) => client.post("/bom", payload),
  update: (id, payload) => client.put(`/bom/${id}`, payload),
  remove: (id) => client.delete(`/bom/${id}`),

  // --- Detailed daily log sub-records ---
  getById: (id) => client.get(`/bom/${id}`),
  addLog: (id, payload) => client.post(`/bom/${id}/logs`, payload),
  deleteLog: (logId) => client.delete(`/bom/logs/${logId}`),
};

// ==============================================
// Milestones API
// ==============================================
export const milestoneApi = {
  add: (payload) => client.post("/milestones", payload),
  update: (idOrPayload, payload) => {
    if (typeof idOrPayload === "number" || typeof idOrPayload === "string") {
      return client.put(`/milestones/${idOrPayload}`, payload);
    }
    if (idOrPayload && idOrPayload.id) {
      return client.put(`/milestones/${idOrPayload.id}`, idOrPayload);
    }
    return client.put("/milestones", idOrPayload);
  },
  remove: (id) => client.delete(`/milestones/${id}`),
};

// ==============================================
// Materials
// ==============================================
export const materialApi = {
  add: (payload) => client.post("/materials", payload),
  update: (id, payload) => client.put(`/materials/${id}`, payload),
  remove: (id) => client.delete(`/materials/${id}`),
};

// ==============================================
// Wards
// ==============================================
export const wardApi = {
  add: (payload) => client.post("/wards", payload),
  update: (id, payload) => client.put(`/wards/${id}`, payload),
  remove: (id) => client.delete(`/wards/${id}`),
};

// ==============================================
// Roads
// ==============================================
export const roadApi = {
  add: (payload) => client.post("/roads", payload),
  update: (id, payload) => client.put(`/roads/${id}`, payload),
  remove: (id) => client.delete(`/roads/${id}`),
  setImage: (payload) => client.put("/roads/image", payload),
};

export default client;