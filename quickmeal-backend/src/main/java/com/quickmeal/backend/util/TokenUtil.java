/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.util;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class TokenUtil {

    private static final String SECRET_KEY = "0123456789abcdef0123456789abcdef"; // 32 ký tự (AES-256)

    public static String encrypt(String data) throws Exception {
        final var key = new SecretKeySpec(SECRET_KEY.getBytes(), "AES");
        final var cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes()));
    }

    public static String decrypt(String encryptedData) throws Exception {
        final var key = new SecretKeySpec(SECRET_KEY.getBytes(), "AES");
        final var cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, key);
        return new String(cipher.doFinal(Base64.getDecoder().decode(encryptedData)));
    }

    public static String getTokenFromRequest(HttpServletRequest request) {
        final var bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
