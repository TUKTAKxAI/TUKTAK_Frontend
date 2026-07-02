import axios from "axios";

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_PREFIX = "/api/v1";

function getBaseURL() {
    const baseURL = RAW_API_BASE_URL.replace(/\/$/, "");
    return baseURL.endsWith(API_PREFIX) ? baseURL : `${baseURL}${API_PREFIX}`;
}

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default api;
