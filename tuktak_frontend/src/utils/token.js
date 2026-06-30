/**
 * Access Token
 */
export const saveAccessToken = (token) => {
    localStorage.setItem("accessToken", token);
};

export const getAccessToken = () => {
    return localStorage.getItem("accessToken");
};

export const removeAccessToken = () => {
    localStorage.removeItem("accessToken");
};

/**
 * Refresh Token
 */
export const saveRefreshToken = (token) => {
    localStorage.setItem("refreshToken", token);
};

export const getRefreshToken = () => {
    return localStorage.getItem("refreshToken");
};

export const removeRefreshToken = () => {
    localStorage.removeItem("refreshToken");
};

/**
 * Access + Refresh 한번에 저장
 */
export const saveTokens = (accessToken, refreshToken) => {
    saveAccessToken(accessToken);
    saveRefreshToken(refreshToken);
};

export const removeTokens = () => {
    removeAccessToken();
    removeRefreshToken();
};

/**
 * User 정보
 */
export const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
    const user = localStorage.getItem("user");

    if (!user) return null;

    return JSON.parse(user);
};

export const removeUser = () => {
    localStorage.removeItem("user");
};

/**
 * 전체 삭제 (로그아웃)
 */
export const clearAuth = () => {
    removeTokens();
    removeUser();
};