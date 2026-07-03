import api from "./api";

/**
 * 현재 로그인한 사용자 조회
 */
export const getMe = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

/**
 * 내 정보 수정
 */
export const updateMe = async (formData) => {
    const response = await api.patch(
        "/users/me",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};