/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.exception.impl;

import org.springframework.security.core.AuthenticationException;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public final class MyJwtDecoderException extends AuthenticationException {

    public MyJwtDecoderException() {
        super("Lỗi không xác định khi xử lý JWT");
    }

    public MyJwtDecoderException(String message) {
        super(message);
    }

    public MyJwtDecoderException(String message, Throwable cause) {
        super(message, cause);
    }

}
