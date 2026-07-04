import api from "./api";

/**
 * 현재 로그인한 사용자 조회
 */
export const getMe = async () => {
    return api.get("/users/me");
};

/**
 * 내 정보 수정
 */
export const updateMe = async (formData) => {
    return api.patch(
        "/users/me",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};
