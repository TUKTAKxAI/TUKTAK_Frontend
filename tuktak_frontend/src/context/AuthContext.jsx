import { useCallback, useEffect, useState } from "react";
import { getMe } from "../services/userService";
import { logout as logoutApi } from "../services/authService";
import { AuthContext } from "./authContext";
import { clearAuthTokens } from "../api/client";

function unwrapUser(result) {
    return result?.data?.user ?? result?.data ?? result?.user ?? result;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    const initialize = useCallback(async () => {
        try {
            const result = await getMe();

            setUser(unwrapUser(result));
            setIsLogin(true);
        } catch {
            clearAuthTokens({ redirectToLogin: window.location.pathname !== "/login" });
            setUser(null);
            setIsLogin(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(initialize);
    }, [initialize]);

    useEffect(() => {
        const handleAuthCleared = () => {
            setUser(null);
            setIsLogin(false);
            setLoading(false);
        };

        window.addEventListener("tuktak:auth-cleared", handleAuthCleared);
        return () => window.removeEventListener("tuktak:auth-cleared", handleAuthCleared);
    }, []);

    const login = async () => {
        const result = await getMe();
        const nextUser = unwrapUser(result);

        setUser(nextUser);
        setIsLogin(true);
        return nextUser;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            setUser(null);
            setIsLogin(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLogin,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
