// src/services/categoryService.ts
import api from "./api";

export interface CategoryDTO {
    id: number;
    name: string;
}

export interface CategoryCreateUpdateDTO {
    name: string;
}

export const categoryService = {
    // Lấy tất cả danh mục
    getAll: async (): Promise<CategoryDTO[]> => {
        const res = await api.get("/categories");
        return res.data;
    },

    // Tạo mới danh mục
    create: async (data: CategoryCreateUpdateDTO): Promise<CategoryDTO> => {
        const res = await api.post("/categories", data);
        return res.data;
    },

    // Cập nhật danh mục
    update: async (id: number, data: CategoryCreateUpdateDTO): Promise<CategoryDTO> => {
        const res = await api.put(`/categories/${id}`, data);
        return res.data;
    },

    // Xóa danh mục
    remove: async (id: number): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
};