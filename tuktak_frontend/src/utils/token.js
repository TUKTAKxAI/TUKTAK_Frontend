/**
 * Access Token
 */
export const saveAccessToken = (token) => {
    removeAccessToken();
};

export const getAccessToken = () => {
    return null;
};

export const removeAccessToken = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tuktak_access_token");
};

/**
 * Refresh Token
 */
export const saveRefreshToken = (token) => {
    removeRefreshToken();
};

export const getRefreshToken = () => {
    return null;
};

export const removeRefreshToken = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tuktak_refresh_token");
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
