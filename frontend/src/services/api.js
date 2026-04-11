import axios from "axios";

const API = axios.create({
  // Add /api to the end of the URL
  baseURL: "https://swapnest-api.onrender.com/api",
});

// Automatically attach the JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("swapnest_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
