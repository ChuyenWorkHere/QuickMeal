// src/hooks/useAuth.ts
import { useState } from "react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import type { LoginResponse } from "@/types";
import { ApiCode } from "@/constants/ApiCode";
import { useAuthContext } from "@/context/AuthContext";
import type { RoleType } from "@/types";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const { login: contextLogin, logout: contextLogout } = useAuthContext();

    const login = async (userName: string, password: string) => {
        setLoading(true);
        try {
            const res = await authService.login({ userName, password });

            console.log("Login data:", userName, password, res);

            switch (res.status) {
                case 200: {
                    switch (res.data.code) {
                        case ApiCode.SUCCESS: {

                            const data = res.data.data as LoginResponse;
                            // Lưu token + role + user info vào context
                            contextLogin({
                                token: data.token,
                                role: data.role as RoleType,
                                userName: data.userName,
                                fullName: data.fullName,
                                email: data.email,
                                phone: data.phone,
                            });
                            return { success: true, role: data.role as RoleType };
                        }
                        case ApiCode.ERROR: {
                            return {
                                success: false,
                                message: res.data.data,
                            }
                        }
                        case ApiCode.INVALID_PARAM: {
                            const errors = res.data.data ?? {};
                            // Lấy tất cả message từ các field
                            const messages = Object.values(errors);
                            return {
                                success: false,
                                message: (messages.join("\n") || "Thông tin đăng nhập không hợp lệ"),
                            }
                        }
                    }
                    break;
                }
            }
            return {
                success: false
            }
        } catch (err: any) {
            console.log("Login error:", err);
            return {
                success: false,
                message: err?.message,
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await authService.logout();
        contextLogout();
        toast.success("Đăng xuất thành công!");
    };

    return {
        login,
        logout,
        loading,
    };
};
