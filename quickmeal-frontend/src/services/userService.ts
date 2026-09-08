// src/services/userService.ts
import api from "./api";
import type { RoleType } from "@/types";

/** DTO trả về từ backend */
export interface UserDTO {
    id: number;
    userName: string;
    fullName: string;
    email: string;
    phone: string;
    role: RoleType;
    enabled: boolean;
}

/** DTO dùng cho create */
export interface UserCreateDTO {
    userName: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    role: RoleType;
}

/** DTO dùng cho update */
export interface UserUpdateDTO {
    fullName: string;
    email: string;
    phone: string;
    role: RoleType;
    enabled: boolean;
}

/** Response phân trang từ Spring Boot */
export interface PageResponse<T> {
    content: T[];
    number: number;         // page hiện tại (0-based)
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export const userService = {

    // ✅ LẤY USER CÓ PHÂN TRANG VÀ TÌM KIẾM (SERVER SIDE)
    getPage: async (
        page = 0,
        size = 10,
        search?: string // <-- THÊM THAM SỐ search
    ): Promise<PageResponse<UserDTO>> => {
        const res = await api.get("/admin/users", {
            params: {
                page,
                size,
                // Gửi tham số search.
                // .trim() để loại bỏ khoảng trắng dư thừa.
                // || undefined để loại bỏ param nếu chuỗi rỗng/null, giúp backend dễ xử lý hơn.
                search: search?.trim() || undefined
            }
        });
        return res.data;
    },

    create: async (data: UserCreateDTO): Promise<UserDTO> => {
        const res = await api.post("/admin/users", data);
        return res.data;
    },

    update: async (id: number, data: UserUpdateDTO): Promise<UserDTO> => {
        const res = await api.put(`/admin/users/${id}`, data);
        return res.data;
    },

    // Soft delete
    remove: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    }
};