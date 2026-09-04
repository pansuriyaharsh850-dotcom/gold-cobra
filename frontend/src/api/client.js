import axios from "axios";

const client = axios.create({ baseURL: "https://gold-cobra.onrender.com/api" });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("gold_cobra_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
const resource = (path) => ({ add: (data) => client.post(path, data), update: (id, data) => client.put(`${path}/${id}`, data), remove: (id) => client.delete(`${path}/${id}`) });
export const authApi = { login: (data) => client.post("/auth/login", data) };
export const wardApi = resource("/wards");
export const roadApi = { ...resource("/roads"), setImage: (data) => client.put("/roads/image", data) };
export const milestoneApi = { ...resource("/milestones"), update: (data) => client.put(`/milestones/${data.id}`, data) };
export const materialApi = resource("/materials");
export const bomApi = { ...resource("/bom"), getById: (id) => client.get(`/bom/${id}`), addLog: (id, data) => client.post(`/bom/${id}/logs`, data), deleteLog: (id) => client.delete(`/bom/logs/${id}`) };
