import api from "./api";
import { clearAuthTokens, getRefreshToken, setAuthTokens } from "../api/client";

/**
 * 로그인
 * POST /auth/login
 */
export const login = async (email, password) => {
    const data = await api.post("/auth/login", {
        email,
        password,
    });

    setAuthTokens(data);
    return data;
};

/**
 * 고객 회원가입
 * POST /auth/signup/customer
 */
export const signupCustomer = async (signupData) => {
    return api.post(
        "/auth/signup/customer",
        signupData
    );
};

/**
 * 파트너 회원가입
 * POST /auth/signup/contractor
 */
export const signupPartner = async (signupData) => {
    return api.post(
        "/auth/signup/contractor",
        signupData
    );
};

/**
 * 약관 카탈로그 조회 (로그인 전에도 호출 가능)
 * GET /auth/agreements
 *
 * 응답: [{ terms_type, terms_version, terms_title, terms_content_url, is_required }, ...]
 *
 * 참고: 이 프로젝트의 다른 함수들(login, signupCustomer 등)은 모두
 * `api.post(...)` 호출 결과에서 다시 `.data`를 꺼내는 패턴을 쓰고 있어서
 * 동일한 스타일로 맞췄습니다. 호출해보고 결과가 undefined 로 나오면
 * `return response.data` 대신 `return response`로 바꿔주세요.
 */
export const getAgreementCatalog = async () => {
    return api.get("/auth/agreements");
};

/**
 * 이메일 중복 확인
 * GET /auth/email-availability
 */
export const checkEmailAvailability = async (email) => {
    return api.get(
        "/auth/email-availability",
        {
            params: {
                email,
            },
        }
    );
};

/**
 * 로그아웃
 * 쿠키는 브라우저가 자동 전송
 */
export const logout = async () => {
    const refreshToken = getRefreshToken();

    try {
        return await api.post("/auth/logout", refreshToken ? { refresh_token: refreshToken } : undefined);
    } finally {
        clearAuthTokens();
    }
};

/**
 * 토큰 재발급
 */
export const refresh = async () => {
    const data = await api.post("/auth/refresh", {
        refresh_token: getRefreshToken(),
    });

    setAuthTokens(data);
    return data;
};
