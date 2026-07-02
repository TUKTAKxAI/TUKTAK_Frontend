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
 * POST /auth/signup/contractor
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
 * 쿠키는 브라우저가 자동 전송
 */
export const logout = async () => {
    const response = await api.post("/auth/logout");

    return response.data;
};