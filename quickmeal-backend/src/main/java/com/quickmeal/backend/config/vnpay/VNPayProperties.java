package com.quickmeal.backend.config.vnpay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình kết nối VNPay, đọc từ application.yaml (prefix "vnpay").
 */
@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VNPayProperties {

    private String tmnCode;
    private String hashSecret;
    private String version = "2.1.0";
    private String payUrl;
    private String apiUrl;
    private String returnUrl;
    private String ipnUrl;
    private String frontendReturnUrl;
}
