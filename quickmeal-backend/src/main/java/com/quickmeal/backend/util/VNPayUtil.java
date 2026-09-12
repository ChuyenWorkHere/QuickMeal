package com.quickmeal.backend.util;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Helper build/verify chữ ký và các tham số theo đúng chuẩn VNPay
 * (xem tài liệu tích hợp: sandbox.vnpayment.vn/apis/docs).
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class VNPayUtil {

    public static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public static String hmacSHA512(String key, String data) {
        try {
            final var hmac512 = Mac.getInstance("HmacSHA512");
            final var secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            final var bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            final var sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo chữ ký VNPay", e);
        }
    }

    /**
     * Build chuỗi để hash: các field sắp xếp alphabet, dạng
     * field1=value1&field2=value2..., value đã url-encode. Field null/rỗng bị bỏ qua.
     * Dùng cả khi ký (tạo payment URL) lẫn khi verify (callback trả về).
     */
    public static String hashAllFields(Map<String, String> fields, String secretKey) {
        final var fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        final var hashData = new StringBuilder();
        final Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            final var fieldName = itr.next();
            final var fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
            }
            if (itr.hasNext()) {
                hashData.append('&');
            }
        }
        return hmacSHA512(secretKey, hashData.toString());
    }

    /**
     * Build query string đầy đủ (cả field name lẫn value đều url-encode) để ghép vào payUrl.
     * KHÔNG bao gồm vnp_SecureHash - gọi hashAllFields riêng rồi tự ghép thêm vào cuối.
     */
    public static String buildQueryString(Map<String, String> fields) {
        final var fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        final var query = new StringBuilder();
        final Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            final var fieldName = itr.next();
            final var fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
            }
            if (itr.hasNext()) {
                query.append('&');
            }
        }
        return query.toString();
    }

    /**
     * Verify chữ ký của 1 request callback (return/IPN) gửi về.
     * secureHash trong params sẽ tự bị loại ra trước khi tính lại hash để so sánh.
     */
    public static boolean validateSignature(Map<String, String> params, String secretKey) {
        final var receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }
        final var copy = new java.util.HashMap<>(params);
        copy.remove("vnp_SecureHash");
        copy.remove("vnp_SecureHashType");
        final var computedHash = hashAllFields(copy, secretKey);
        return computedHash.equalsIgnoreCase(receivedHash);
    }

    public static String getIpAddress(HttpServletRequest request) {
        var ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        } else {
            ip = ip.split(",")[0].trim();
        }
        // VNPay yêu cầu IPv4, môi trường local có thể trả về ::1
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }

    public static String now() {
        return LocalDateTime.now().format(DATE_FORMAT);
    }

    public static String plusMinutes(long minutes) {
        return LocalDateTime.now().plusMinutes(minutes).format(DATE_FORMAT);
    }

    /**
     * vnp_TxnRef phải unique - ghép orderId + timestamp để hỗ trợ tạo lại link thanh toán
     * nhiều lần cho cùng 1 đơn (ví dụ lần trước hết hạn/thất bại) mà không bị trùng mã.
     */
    public static String generateTxnRef(Long orderId) {
        return orderId + "_" + now();
    }

    public static String randomRequestId() {
        return String.valueOf(100000 + new SecureRandom().nextInt(900000));
    }
}
