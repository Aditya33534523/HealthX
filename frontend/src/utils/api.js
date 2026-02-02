import axios from 'axios';

// In development with Docker, we proxy /api to the backend
// In production, we might need a full URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;
