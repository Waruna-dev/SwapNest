import axios from 'axios';

const API = axios.create({
    // If VITE_API_URL is not set, use your local backend.
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Automatically attach the JWT token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('swapnest_token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;