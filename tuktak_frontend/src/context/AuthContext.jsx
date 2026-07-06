import { createContext, useContext, useEffect, useState } from "react";
import {
    getUser,
    clearAuth,
    saveTokens,
    saveUser,
} from "../utils/token";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        const storedUser = getUser();

        if (storedUser) {
            setUser(storedUser);
            setIsLogin(true);
        }
    }, []);

    /**
     * 로그인 성공 시 호출
     */
    const login = (response) => {
        saveTokens(response.access_token, response.refresh_token);
        saveUser(response.user);

        setUser(response.user);
        setIsLogin(true);
    };

    /**
     * 로그아웃
     */
    const logout = () => {
        clearAuth();

        setUser(null);
        setIsLogin(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLogin,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
