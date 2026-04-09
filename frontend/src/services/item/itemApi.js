import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const getItems = async (params = {}) => API.get("/items", { params });
export const getItem = async (id) => API.get(`/items/${id}`);
export const createItem = async (itemData) => API.post("/items", itemData);
export const updateItem = async (id, itemData) =>
  API.put(`/items/${id}`, itemData);
export const deleteItem = async (id) => API.delete(`/items/${id}`);
export const getNearbyItems = async (params = {}) =>
  API.get("/items/nearby", { params });
export const getSuggestions = async (params = {}) =>
  API.get("/items/suggestions", { params });
export const getTrendingItems = async (params = {}) =>
  API.get("/items/trending", { params });
