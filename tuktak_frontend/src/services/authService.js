import api from "./api";

/**
 * 로그인
 * POST /auth/login
 */
export const login = async (email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};

/**
 * 고객 회원가입
 * POST /auth/signup/customer
 */
export const signupCustomer = async (signupData) => {
    const response = await api.post(
        "/auth/signup/customer",
        signupData
    );

    return response.data;
};

/**
 * 파트너 회원가입
 * (추후 사용)
 */
export const signupPartner = async (signupData) => {
    const response = await api.post(
        "/auth/signup/contractor",
        signupData
    );

    return response.data;
};

/**
 * 이메일 중복 확인
 * GET /auth/email-availability
 */
export const checkEmailAvailability = async (email) => {
    const response = await api.get(
        "/auth/email-availability",
        {
            params: {
                email,
            },
        }
    );

    return response.data;
};

/**
 * 로그아웃
 */
export const logout = async (refreshToken) => {
    const response = await api.post(
        "/auth/logout",
        {
            refresh_token: refreshToken,
        }
    );

    return response.data;
};

/**
 * 토큰 재발급
 */
export const refresh = async (refreshToken) => {
    const response = await api.post(
        "/auth/refresh",
        {
            refresh_token: refreshToken,
        }
    );

    return response.data;
};