// src/services/productService.ts
import api from "./api";

export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  stock?: number;
}

export const productService = {
  getAll: async (): Promise<ProductDTO[]> => {
    const res = await api.get("/products");
    return res.data;
  },

  // Lấy món special (random) từ backend
  getSpecial: async (): Promise<ProductDTO[]> => {
    const res = await api.get("/products/special");
    return res.data;
  },

  create: async (data: FormData): Promise<ProductDTO> => {
    const res = await api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  update: async (id: number, data: FormData): Promise<ProductDTO> => {
    const res = await api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};