// src/hooks/useRegister.ts
import { useState } from "react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import type { RegisterRequest, RegisterResponse } from "@/types";
import { ApiCode } from "@/constants/ApiCode";
import { useAuthContext } from "@/context/AuthContext";
import type { RoleType } from "@/types";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const { login: contextLogin } = useAuthContext();

    const register = async (dto: RegisterRequest) => {
        setLoading(true);
        try {
            const res = await authService.register(dto);

            console.log("Register response:", res);

            switch (res.status) {
                case 200: {
                    switch (res.data.code) {
                        case ApiCode.SUCCESS: {
                            const data = res.data.data as RegisterResponse;
                            // Tự động login sau khi đăng ký
                            contextLogin({
                                token: data.token,
                                role: data.role as RoleType,
                                userName: data.userName,
                                fullName: data.fullName,
                                email: data.email,
                                phone: data.phone,
                            });
                            toast.success("Đăng ký thành công!");
                            return { success: true, role: data.role as RoleType };
                        }
                        case ApiCode.ERROR: {
                            toast.error(res.data.data || "Có lỗi xảy ra");
                            return { success: false, message: res.data.data };
                        }
                        case ApiCode.INVALID_PARAM: {
                            const errors = res.data.data ?? {};
                            const messages = Object.values(errors).flat();
                            toast.error(messages.join("\n") || "Thông tin không hợp lệ");
                            return { success: false, message: messages.join("\n") };
                        }
                    }
                    break;
                }
            }
            return { success: false, message: "Lỗi không xác định" };
        } catch (err: any) {
            console.error("Register error:", err);
            toast.error(err?.message || "Đăng ký thất bại");
            return { success: false, message: err?.message };
        } finally {
            setLoading(false);
        }
    };

    return { register, loading };
};
