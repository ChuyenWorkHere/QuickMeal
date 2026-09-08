// src/services/api.ts
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api", // đổi sau nếu cần
    timeout: 10000,
});

// 💥 Tự động add token nếu có
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        console.log('token >>>>> ', token)
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 💥 Xử lý lỗi chung
api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err);
        throw err;
    }
);

export default api;
