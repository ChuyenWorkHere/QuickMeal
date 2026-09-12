package com.quickmeal.backend.service;

import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.config.vnpay.VNPayProperties;
import com.quickmeal.backend.constant.OrderStatus;
import com.quickmeal.backend.constant.PaymentMethod;
import com.quickmeal.backend.constant.PaymentStatus;
import com.quickmeal.backend.entity.OrderEntity;
import com.quickmeal.backend.entity.OrderItemEntity;
import com.quickmeal.backend.entity.ProductEntity;
import com.quickmeal.backend.exception.BusinessException;
import com.quickmeal.backend.repo.OrderRepository;
import com.quickmeal.backend.repo.ProductRepository;
import com.quickmeal.backend.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Toàn bộ nghiệp vụ giao tiếp với VNPay: tạo URL thanh toán, xử lý callback
 * (return/IPN dùng chung 1 hàm processCallback để đảm bảo idempotent),
 * tra soát giao dịch (querydr) và hoàn tiền (refund).
 *
 * Lưu ý: hàm pay/return/ipn dùng chữ ký query-string (VNPayUtil.hashAllFields) đã rất
 * chuẩn theo tài liệu VNPay. Phần querydr/refund dùng API JSON riêng (merchant_webapi) -
 * nên đối chiếu lại field/response thực tế khi test với sandbox trước khi dùng thật.
 */
@Service
@RequiredArgsConstructor
public class VNPayService {

    private static final long PAYMENT_EXPIRE_MINUTES = 15;
    // Đơn UNPAID quá mốc này mà querydr vẫn không xác nhận được gì thì coi như hết hạn -> hủy
    static final long RECONCILE_EXPIRE_MINUTES = 20;

    private final VNPayProperties vnPayProperties;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public String createPaymentUrl(Long orderId, String requestingUserName, HttpServletRequest request) {
        final var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getUserName().equals(requestingUserName)) {
            throw new BusinessException("Bạn không có quyền thanh toán đơn hàng này");
        }
        if (order.getPaymentMethod() != PaymentMethod.VNPAY) {
            throw new BusinessException("Đơn hàng này không dùng phương thức thanh toán VNPay");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException("Đơn hàng đã được thanh toán");
        }

        final var txnRef = VNPayUtil.generateTxnRef(order.getId());
        order.setVnpTxnRef(txnRef);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        orderRepository.save(order);

        final Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnPayProperties.getVersion());
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(Math.round(order.getTotalPrice() * 100)));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnPayProperties.getReturnUrl());
        params.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));
        params.put("vnp_CreateDate", VNPayUtil.now());
        params.put("vnp_ExpireDate", VNPayUtil.plusMinutes(PAYMENT_EXPIRE_MINUTES));

        final var secureHash = VNPayUtil.hashAllFields(params, vnPayProperties.getHashSecret());
        final var queryString = VNPayUtil.buildQueryString(params);
        final var paymentUrl = vnPayProperties.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
        Logger.info("[VNPay] Tạo payment URL cho đơn " + order.getId() + ": " + paymentUrl);
        return paymentUrl;
    }

    /**
     * Dùng chung cho cả return-handler lẫn IPN-handler. Idempotent: gọi nhiều lần với
     * cùng 1 giao dịch chỉ ghi DB đúng 1 lần (lần đầu tiên tới, dù là return hay IPN).
     */
    @Transactional
    public CallbackResult processCallback(Map<String, String> params) {
        Logger.info("[VNPay] Nhận callback với params: " + params);

        if (!VNPayUtil.validateSignature(params, vnPayProperties.getHashSecret())) {
            Logger.error("[VNPay] Chữ ký không hợp lệ cho callback: " + params, null);
            return CallbackResult.invalidSignature();
        }

        final var txnRef = params.get("vnp_TxnRef");
        final var orderOpt = orderRepository.findByVnpTxnRef(txnRef);
        if (orderOpt.isEmpty()) {
            Logger.error("[VNPay] Không tìm thấy order với vnp_TxnRef=" + txnRef, null);
            return CallbackResult.orderNotFound();
        }
        final var order = orderOpt.get();

        // Idempotent: đã xử lý rồi (do return hoặc IPN lần trước) thì không xử lý lại
        if (order.getPaymentStatus() != PaymentStatus.UNPAID) {
            return CallbackResult.alreadyConfirmed(order);
        }

        final long expectedAmount = Math.round(order.getTotalPrice() * 100);
        long receivedAmount;
        try {
            receivedAmount = Long.parseLong(params.get("vnp_Amount"));
        } catch (NumberFormatException e) {
            receivedAmount = -1;
        }
        if (receivedAmount != expectedAmount) {
            return CallbackResult.invalidAmount(order);
        }

        final var success = "00".equals(params.get("vnp_ResponseCode"));
        if (success) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setVnpTransactionNo(params.get("vnp_TransactionNo"));
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.CANCELLED);
            restoreStock(order);
        }
        orderRepository.save(order);
        return CallbackResult.processed(order, success);
    }

    /**
     * Hỏi lại VNPay trạng thái thật của 1 giao dịch (dùng khi nghi ngờ IPN bị mất).
     * Nếu VNPay xác nhận thành công -> tự "cứu" đơn về PAID.
     * Nếu VNPay xác nhận thất bại, hoặc đơn đã quá hạn mà vẫn không có kết quả -> hủy + hoàn kho.
     */
    @Transactional
    public void reconcile(OrderEntity order) {
        if (order.getVnpTxnRef() == null) {
            return;
        }

        final var requestId = VNPayUtil.randomRequestId();
        final var createDate = VNPayUtil.now();
        final var orderInfo = "Kiem tra giao dich don hang " + order.getId();
        final var ipAddr = "127.0.0.1";
        final var transactionDate = order.getCreatedAt().format(VNPayUtil.DATE_FORMAT);

        final var hashData = String.join("|",
                requestId, vnPayProperties.getVersion(), "querydr", vnPayProperties.getTmnCode(),
                order.getVnpTxnRef(), transactionDate, createDate, ipAddr, orderInfo);
        final var secureHash = VNPayUtil.hmacSHA512(vnPayProperties.getHashSecret(), hashData);

        final var body = new JSONObject();
        body.put("vnp_RequestId", requestId);
        body.put("vnp_Version", vnPayProperties.getVersion());
        body.put("vnp_Command", "querydr");
        body.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        body.put("vnp_TxnRef", order.getVnpTxnRef());
        body.put("vnp_OrderInfo", orderInfo);
        body.put("vnp_TransactionDate", transactionDate);
        body.put("vnp_CreateDate", createDate);
        body.put("vnp_IpAddr", ipAddr);
        body.put("vnp_SecureHash", secureHash);

        JSONObject response;
        try {
            response = callVnpayApi(body);
        } catch (Exception e) {
            Logger.error("Không gọi được querydr cho đơn " + order.getId(), e);
            return; // lỗi mạng tạm thời -> để lượt job sau thử lại, không kết luận hủy vội
        }

        final var apiAccepted = "00".equals(response.optString("vnp_ResponseCode"));
        final var txnStatus = response.optString("vnp_TransactionStatus", "");

        if (apiAccepted && "00".equals(txnStatus)) {
            // VNPay xác nhận đã thanh toán thành công dù IPN có thể đã bị mất -> cứu đơn
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setVnpTransactionNo(response.optString("vnp_TransactionNo", order.getVnpTransactionNo()));
            orderRepository.save(order);
            return;
        }

        final var isDefinitelyFailed = apiAccepted && !txnStatus.isEmpty() && !"01".equals(txnStatus);
        final var isExpired = order.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(RECONCILE_EXPIRE_MINUTES));

        if (isDefinitelyFailed || isExpired) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setStatus(OrderStatus.CANCELLED);
            restoreStock(order);
            orderRepository.save(order);
        }
        // còn lại (txnStatus = "01" - đang chờ, và chưa hết hạn): bỏ qua, chờ lượt job kế tiếp
    }

    /**
     * Hủy + hoàn tiền cho 1 đơn VNPay đã PAID. Chỉ nên cho ADMIN gọi (kiểm tra ở controller),
     * vì đây là hành động tác động tới tiền thật.
     */
    @Transactional
    public void refundOrder(OrderEntity order, String performedBy) {
        if (order.getPaymentMethod() != PaymentMethod.VNPAY || order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BusinessException("Chỉ có thể hoàn tiền cho đơn thanh toán VNPay đã PAID");
        }
        if (order.getStatus() == OrderStatus.SHIPPING || order.getStatus() == OrderStatus.COMPLETED) {
            throw new BusinessException("Đơn đang giao hoặc đã hoàn tất, không thể tự động hủy & hoàn tiền qua hệ thống");
        }

        final var requestId = VNPayUtil.randomRequestId();
        final var createDate = VNPayUtil.now();
        final var orderInfo = "Hoan tien don hang " + order.getId();
        final var ipAddr = "127.0.0.1";
        final var transactionDate = order.getCreatedAt().format(VNPayUtil.DATE_FORMAT);
        final var amount = Math.round(order.getTotalPrice() * 100);
        final var transactionNo = order.getVnpTransactionNo() == null ? "0" : order.getVnpTransactionNo();

        final var hashData = String.join("|",
                requestId, vnPayProperties.getVersion(), "refund", vnPayProperties.getTmnCode(),
                "02", order.getVnpTxnRef(), String.valueOf(amount), transactionNo,
                transactionDate, performedBy, createDate, ipAddr, orderInfo);
        final var secureHash = VNPayUtil.hmacSHA512(vnPayProperties.getHashSecret(), hashData);

        final var body = new JSONObject();
        body.put("vnp_RequestId", requestId);
        body.put("vnp_Version", vnPayProperties.getVersion());
        body.put("vnp_Command", "refund");
        body.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        body.put("vnp_TransactionType", "02");
        body.put("vnp_TxnRef", order.getVnpTxnRef());
        body.put("vnp_Amount", amount);
        body.put("vnp_OrderInfo", orderInfo);
        body.put("vnp_TransactionNo", transactionNo);
        body.put("vnp_TransactionDate", transactionDate);
        body.put("vnp_CreateBy", performedBy);
        body.put("vnp_CreateDate", createDate);
        body.put("vnp_IpAddr", ipAddr);
        body.put("vnp_SecureHash", secureHash);

        final var response = callVnpayApi(body);
        if (!"00".equals(response.optString("vnp_ResponseCode"))) {
            throw new BusinessException("VNPay từ chối yêu cầu hoàn tiền: "
                    + response.optString("vnp_Message", "Không rõ lý do"));
        }

        order.setPaymentStatus(PaymentStatus.REFUNDED);
        order.setStatus(OrderStatus.CANCELLED);
        restoreStock(order);
        orderRepository.save(order);
    }

    private JSONObject callVnpayApi(JSONObject body) {
        try {
            final var client = HttpClient.newHttpClient();
            final var httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(vnPayProperties.getApiUrl()))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();
            final var response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            return new JSONObject(response.body());
        } catch (Exception e) {
            Logger.error("Lỗi khi gọi VNPay Merchant API", e);
            throw new BusinessException("Không thể kết nối tới VNPay, vui lòng thử lại sau");
        }
    }

    private void restoreStock(OrderEntity order) {
        for (OrderItemEntity item : order.getItems()) {
            final ProductEntity product = item.getProduct();
            if (product.getStock() != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }

    @Getter
    @AllArgsConstructor
    public static class CallbackResult {

        private final boolean success;
        private final OrderEntity order;
        private final String rspCode;
        private final String message;

        public static CallbackResult invalidSignature() {
            return new CallbackResult(false, null, "97", "Invalid signature");
        }

        public static CallbackResult orderNotFound() {
            return new CallbackResult(false, null, "01", "Order not found");
        }

        public static CallbackResult invalidAmount(OrderEntity order) {
            return new CallbackResult(false, order, "04", "Invalid amount");
        }

        public static CallbackResult alreadyConfirmed(OrderEntity order) {
            return new CallbackResult(order.getPaymentStatus() == PaymentStatus.PAID, order, "02", "Order already confirmed");
        }

        public static CallbackResult processed(OrderEntity order, boolean success) {
            return new CallbackResult(success, order, "00", "Confirm Success");
        }
    }
}
