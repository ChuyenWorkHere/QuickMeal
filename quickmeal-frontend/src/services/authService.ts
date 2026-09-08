// src/services/authService.ts
import api from "./api";
import { API } from "@/constants/ConstApi";
import type { LoginRequest, RegisterRequest } from "@/types";

export const authService = {
    login: async (dto: LoginRequest) => {
        return await api.post(API.AUTH.LOGIN, dto);
    },

    register: async (dto: RegisterRequest) => {
        return await api.post(API.PUBLIC.REGISTER, dto);
    },


    logout: async () => {
        await api.post(API.AUTH.LOGOUT);
    },
};
