import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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