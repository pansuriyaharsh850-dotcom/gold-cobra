import axios from "axios";

const API = "https://gold-cobra.onrender.com/api";

const client = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("gold_cobra_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    `${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    config.data
  );

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error.response);

    return Promise.reject({
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message,
      data: error.response?.data,
    });
  }
);

// =================== AUTH ===================

export const authApi = {
  login: (payload) => client.post("/auth/login", payload),
};

// =================== BOM ====================

export const bomApi = {
  add: (payload) => client.post("/bom", payload),
  update: (id, payload) => client.put(`/bom/${id}`, payload),
  remove: (id) => client.delete(`/bom/${id}`),
};

// ================= MILESTONES =================

export const milestoneApi = {
  get: (road) =>
    client.get("/milestones", {
      params: { road },
    }),

  add: (payload) => client.post("/milestones", payload),

  update: (payload) => client.put("/milestones", payload),

  remove: (id) => client.delete(`/milestones/${id}`),
};

// ================= MATERIALS =================

export const materialApi = {
  add: (payload) => client.post("/materials", payload),
  update: (id, payload) => client.put(`/materials/${id}`, payload),
  remove: (id) => client.delete(`/materials/${id}`),
};

export default client;