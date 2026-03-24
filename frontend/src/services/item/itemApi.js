import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

// Automatically attach the JWT tok
// en to every request

export const getItems = async () => API.get("/items");
export const getItem = async (id) => API.get(`/items/${id}`);
export const createItem = async (itemData) => API.post("/items", itemData);
export const updateItem = async (id, itemData) =>
  API.put(`/items/${id}`, itemData);
export const deleteItem = async (id) => API.delete(`/items/${id}`);
export const searchItems = async (query) => API.get(`/items/search?q=${query}`);
