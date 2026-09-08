// context/AuthContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { RoleType } from "@/types";


interface AuthContextType {
    token: string | null;
    role: RoleType | null;
    userName: string | null;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    login: (data: { token: string; role: RoleType; userName: string; fullName: string; email: string; phone: string }) => void;
    logout: () => void;
    updateUser: (data: { fullName?: string; email?: string; phone?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [role, setRole] = useState<RoleType | null>(() => (localStorage.getItem("role")?.toUpperCase() as RoleType) || null);
    const [userName, setUserName] = useState<string | null>(() => localStorage.getItem("userName"));
    const [fullName, setFullName] = useState<string | null>(() => localStorage.getItem("fullName"));
    const [email, setEmail] = useState<string | null>(() => localStorage.getItem("email"));
    const [phone, setPhone] = useState<string | null>(() => localStorage.getItem("phone"));

    const login = (data: { token: string; role: RoleType; userName: string; fullName: string; email: string; phone: string }) => {
        const normalizedRole = data.role.toUpperCase() as RoleType;
        setToken(data.token);
        setRole(normalizedRole);
        setUserName(data.userName);
        setFullName(data.fullName);
        setEmail(data.email);
        setPhone(data.phone);

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("userName", data.userName);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phone);
    };

    const logout = () => {
        setToken(null);
        setRole(null);
        setUserName(null);
        setFullName(null);
        setEmail(null);
        setPhone(null);

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("fullName");
        localStorage.removeItem("email");
        localStorage.removeItem("phone");
    };

    const updateUser = (data: { fullName?: string; email?: string; phone?: string }) => {
        if (data.fullName !== undefined) {
            setFullName(data.fullName);
            localStorage.setItem("fullName", data.fullName);
        }
        if (data.email !== undefined) {
            setEmail(data.email);
            localStorage.setItem("email", data.email);
        }
        if (data.phone !== undefined) {
            setPhone(data.phone);
            localStorage.setItem("phone", data.phone);
        }
    };

    return (
        <AuthContext.Provider value={{ token, role, userName, fullName, email, phone, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
