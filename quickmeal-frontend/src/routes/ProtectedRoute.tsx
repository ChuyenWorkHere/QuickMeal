import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { RoleType } from "@/types";
import { useAuthContext } from "@/context/AuthContext";

interface Props {
    children: ReactNode;
    allowedRoles?: ("public" | RoleType)[];
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const { token, role } = useAuthContext();

    // public pages không cần login
    if (!allowedRoles || allowedRoles.includes("public")) return <>{children}</>;

    // chưa login
    if (!token) return <Navigate to="/login" replace />;

    // Nếu role không thuộc allowedRoles → đá về login
    if (!role || !allowedRoles.includes(role)) return <Navigate to="/" replace />;

    return <>{children}</>;
};
