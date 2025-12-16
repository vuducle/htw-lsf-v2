import axios from "axios";

// Central Axios instance for the frontend
// - Base URL points to the NestJS server
// - Adjust headers/interceptors here if auth is added later
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:2808",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default api;
