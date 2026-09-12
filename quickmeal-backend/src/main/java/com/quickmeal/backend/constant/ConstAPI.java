/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.constant;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ConstAPI {

    public static final String PREFIX_API = "/api";

    public static final String API_PUBLIC = PREFIX_API + "/public";

    public static final String API_AUTH = PREFIX_API + "/auth";

    public static final String MAPPING_AUTH_LOGIN = "/login";
    public static final String MAPPING_AUTH_RERESH = "/refresh";
    public static final String MAPPING_AUTH_LOGOUT = "/logout";

    public static final String API_PAYMENT_VNPAY = PREFIX_API + "/payments/vnpay";
    public static final String MAPPING_VNPAY_CREATE = "/create-payment";
    public static final String MAPPING_VNPAY_RETURN = "/return";
    public static final String MAPPING_VNPAY_IPN = "/ipn";

    /**
     * API không cần token
     */
    public static final String[] PUBLIC_GET_API = {
        PREFIX_API + "/products/**",
        PREFIX_API + "/categories/**",
        API_PUBLIC + "/**",
        "/uploads/**",
        "/test/all",
        // VNPay tự gọi vào 2 endpoint này (server-to-server / redirect trình duyệt khách),
        // không thể đính kèm JWT của hệ thống mình được
        API_PAYMENT_VNPAY + MAPPING_VNPAY_RETURN,
        API_PAYMENT_VNPAY + MAPPING_VNPAY_IPN
    };

    /**
     * API không cần token
     */
    public static final String[] PUBLIC_POST_API = {
        API_PUBLIC + "/**",
        API_AUTH + MAPPING_AUTH_LOGIN
    };

}
