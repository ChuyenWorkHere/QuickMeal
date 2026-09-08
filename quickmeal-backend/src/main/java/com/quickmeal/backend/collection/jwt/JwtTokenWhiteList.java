/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.collection.jwt;

import com.khanhdz_core.collection.KhanhDzMapReadWriteLock;
import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.constant.ConstSecurity;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.locks.LockSupport;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class JwtTokenWhiteList {

    private static final KhanhDzMapReadWriteLock<String, String> tokenWhitelist_Username = new KhanhDzMapReadWriteLock<>();
    private static final KhanhDzMapReadWriteLock<String, Long> tokenWhitelist_Expirate = new KhanhDzMapReadWriteLock<>();

    static {
        Thread.startVirtualThread(() -> {
            while (true) {
                LockSupport.parkUntil(System.currentTimeMillis() + 1000);
                checkExpiredTokens();

            }
        });
    }

    public static void addToken(String token, String username) {
        Logger.DebugLogic("Thêm token vào white list: " + token + " username: " + username);
        tokenWhitelist_Expirate.put(token, System.currentTimeMillis() + ConstSecurity.JWT.JWT_EXPIRATION_TIME);
        tokenWhitelist_Username.put(token, username);
    }

    public static void removeToken(String token) {
        Logger.DebugLogic("Remove token khỏi white list: " + token);
        tokenWhitelist_Expirate.remove(token);
        tokenWhitelist_Username.remove(token);
    }

    // Kiểm tra và loại bỏ các token hết hạn
    private static void checkExpiredTokens() {
        try {
            tokenWhitelist_Username.startWrite();
            final var currentTokens = tokenWhitelist_Expirate.startWrite();

            final var currentTime = System.currentTimeMillis();

            // 💡 Quan trọng: Sử dụng Iterator để xóa an toàn trong khi lặp
            final var iterator = currentTokens.entrySet().iterator();

            while (iterator.hasNext()) {
                final var entry = iterator.next();
                final var token = entry.getKey();
                final var expirationTime = entry.getValue();

                if (expirationTime < currentTime) {
                    // 1. Xóa an toàn khỏi Map Expirate (Map đang được lặp)
                    iterator.remove();

                    // 2. Xóa khỏi Map còn lại. 
                    // Tối ưu hóa: Xóa trực tiếp, KHÔNG gọi removeToken(token) để tránh overhead và lẫn lộn logic khóa
                    tokenWhitelist_Username.remove(token);

                    Logger.DebugLogic("Đã xóa token hết hạn: " + token);
                }
            }

        } catch (Exception e) {
            Logger.error("ERROR loop check token", e);
        } finally {
            tokenWhitelist_Username.doneWrite();
            tokenWhitelist_Expirate.doneWrite();
        }
    }

    public static boolean isTokenWhitelisted(String token, String username) {

        if (tokenWhitelist_Username.getOrDefault(token, null) == null) {
            return false;
        }

        final var expirationTime = tokenWhitelist_Expirate.getOrDefault(token, null);
        if (expirationTime == null) {
            return false;
        }

        return System.currentTimeMillis() < expirationTime;
    }
}
