// src/services/orderService.ts
import api from "./api";
import type { OrderResponseDTO } from "@/types";

// Interface cho Spring Data Page
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface OrderRequestDTO {
    userName: string;
    address: string;
    phone: string;
    note: string;
    items: OrderItemRequest[];
}

export const orderService = {
    createOrder: async (data: OrderRequestDTO): Promise<OrderResponseDTO> => {
        const response = await api.post("/orders/checkout", data);
        return response.data;
    },

    getOrders: async (
        page = 0,
        size = 10,
        keyword = "",
        status = "ALL" // Mặc định lấy tất cả
    ): Promise<PageResponse<OrderResponseDTO>> => {
        const params: any = { page, size, keyword, sort: "createdAt,desc" };

        // Nếu khác ALL thì mới gửi status lên filter
        if (status !== "ALL") {
            params.status = status;
        }

        const res = await api.get("/orders", { params });
        return res.data;
    },

    updateStatus: async (id: number, status: string): Promise<OrderResponseDTO> => {
        const response = await api.patch(`/orders/${id}/status?status=${status}`);
        return response.data;
    },
    getOrderById: async (id: number): Promise<OrderResponseDTO> => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
    getMyOrders: async (
        userName: string,
        page: number = 0,
        size: number = 10,
        status: string = "ALL"
    ): Promise<PageResponse<OrderResponseDTO>> => {
        const params: any = { userName, page, size, sort: "createdAt,desc" };
        if (status !== "ALL") {
            params.status = status;
        }
        const res = await api.get(`/orders/my-orders`, { params });
        return res.data;
    },
};