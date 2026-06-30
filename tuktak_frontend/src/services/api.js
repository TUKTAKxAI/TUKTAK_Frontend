import axios from "axios";
import {
    getAccessToken,
    getRefreshToken,
    saveTokens,
    removeTokens,
} from "../utils/token";

const api = axios.create({
    baseURL: "http://localhost:8081/api/v1", // FastAPI 서버 주소
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 시 Access Token 자동 추가
api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 시 Access Token 만료 처리
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 이미 재시도한 요청이면 그대로 종료
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // 401이 아니면 그대로 반환
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            removeTokens();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const response = await axios.post(
                "http://localhost:8000/auth/refresh",
                {
                    refresh_token: refreshToken,
                }
            );

            saveTokens(
                response.data.access_token,
                response.data.refresh_token
            );

            originalRequest.headers.Authorization =
                `Bearer ${response.data.access_token}`;

            return api(originalRequest);
        } catch (err) {
            removeTokens();
            return Promise.reject(err);
        }
    }
);

export default api;