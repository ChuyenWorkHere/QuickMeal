package com.quickmeal.backend.controller;

import com.quickmeal.backend.config.vnpay.VNPayProperties;
import com.quickmeal.backend.constant.ConstAPI;
import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.ApiResponse;
import com.quickmeal.backend.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@RequestMapping(ConstAPI.API_PAYMENT_VNPAY)
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final VNPayProperties vnPayProperties;

    @PostMapping(ConstAPI.MAPPING_VNPAY_CREATE + "/{orderId}")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_CUSTOMER)
    public ResponseEntity<ApiResponse<Map<String, String>>> createPayment(
            @PathVariable Long orderId,
            Authentication authentication,
            HttpServletRequest request) {
        final var paymentUrl = vnPayService.createPaymentUrl(orderId, authentication.getName(), request);
        return ApiResponse.success(Map.of("paymentUrl", paymentUrl));
    }

    // VNPay redirect trình duyệt khách về đây sau khi thanh toán xong - chỉ để hiển thị UI,
    // không có JWT kèm theo nên endpoint này để public (khai báo trong ConstAPI.PUBLIC_GET_API)
    @GetMapping(ConstAPI.MAPPING_VNPAY_RETURN)
    public void handleReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        final var params = extractParams(request);
        final var result = vnPayService.processCallback(params);

        final var status = result.isSuccess() ? "success" : "failed";
        final var orderId = result.getOrder() != null ? String.valueOf(result.getOrder().getId()) : "";
        final var redirectUrl = vnPayProperties.getFrontendReturnUrl()
                + "?status=" + URLEncoder.encode(status, StandardCharsets.UTF_8)
                + "&orderId=" + URLEncoder.encode(orderId, StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }

    // VNPay server gọi thẳng vào đây (server-to-server) - đây là nguồn xác nhận đáng tin cậy nhất
    @GetMapping(ConstAPI.MAPPING_VNPAY_IPN)
    public ResponseEntity<Map<String, String>> handleIpn(HttpServletRequest request) {
        final var params = extractParams(request);
        final var result = vnPayService.processCallback(params);
        return ResponseEntity.ok(Map.of("RspCode", result.getRspCode(), "Message", result.getMessage()));
    }

    private Map<String, String> extractParams(HttpServletRequest request) {
        final Map<String, String> params = new HashMap<>();
        final Enumeration<String> names = request.getParameterNames();
        while (names.hasMoreElements()) {
            final var name = names.nextElement();
            params.put(name, request.getParameter(name));
        }
        return params;
    }
}
