import axios from "axios";

const API = "https://gold-cobra.onrender.com/api";

const client = axios.create({ baseURL: API });

// Attach the logged-in user's token (if any) to every request so
// admin-only write routes on the backend can verify who's asking.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("gold_cobra_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==============================================
// Auth
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
};

// ==============================================
// Milestones
// Note: the update route keys off {road, milestoneName}
// rather than the row id, so it matches the backend contract.
// ==============================================
export const milestoneApi = {
  add: (payload) => client.post("/milestones", payload),
  update: (payload) => client.put("/milestones", payload),
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

export default client;
