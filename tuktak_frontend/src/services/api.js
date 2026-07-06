import axios from "axios";

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

export default api;
