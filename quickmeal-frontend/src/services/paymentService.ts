// src/services/paymentService.ts
import api from "./api";

export const paymentService = {
    // Trả về paymentUrl của VNPay để redirect trình duyệt khách sang
    createVnpayPayment: async (orderId: number): Promise<string> => {
        const response = await api.post(`/payments/vnpay/create-payment/${orderId}`);
        return response.data.data.paymentUrl;
    },
};
