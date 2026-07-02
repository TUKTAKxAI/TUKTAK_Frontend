import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/userService";
import { logout as logoutApi } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            const result = await getMe();

            setUser(result.user);
            setIsLogin(true);
        } catch {
            setUser(null);
            setIsLogin(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        const result = await getMe();

        setUser(result.user);
        setIsLogin(true);
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

export function useAuth() {
    return useContext(AuthContext);
}