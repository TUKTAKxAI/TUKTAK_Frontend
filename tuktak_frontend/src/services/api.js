import axios from "axios";
import { getAccessToken } from "../utils/token";

const API_PREFIX = "/api/v1";
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getBaseURL() {
    const baseUrl = RAW_API_BASE_URL.replace(/\/$/, "");
    return baseUrl.endsWith(API_PREFIX) ? baseUrl : `${baseUrl}${API_PREFIX}`;
}

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
