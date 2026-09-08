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

    /**
     * API không cần token
     */
    public static final String[] PUBLIC_GET_API = {
        PREFIX_API + "/products/**",
        PREFIX_API + "/categories/**",
        API_PUBLIC + "/**",
        "/uploads/**",
        "/test/all"
    };

    /**
     * API không cần token
     */
    public static final String[] PUBLIC_POST_API = {
        API_PUBLIC + "/**",
        API_AUTH + MAPPING_AUTH_LOGIN
    };

}
