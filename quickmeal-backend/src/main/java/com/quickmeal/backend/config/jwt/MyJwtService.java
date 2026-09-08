/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.config.jwt;

import com.khanhdz_core.util.Logger;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.quickmeal.backend.constant.ConstSecurity;
import com.quickmeal.backend.exception.impl.MyJwtDecoderException;
import java.security.SecureRandom;
import java.text.ParseException;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Service
public class MyJwtService {

    private final SecretKey secretKey;

    public MyJwtService() {
        // Sử dụng secret key cố định cho development
        // Trong production nên load từ environment variable hoặc config
        String fixedSecret = "quickmeal-jwt-secret-key-256-bits-long-for-hmacsha256-algorithm";
        byte[] key = fixedSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        // Đảm bảo key có đúng 32 bytes cho HmacSHA256
        if (key.length != 32) {
            key = java.util.Arrays.copyOf(key, 32);
        }
        this.secretKey = new SecretKeySpec(key, "HmacSHA256");

        System.out.println("JWT Secret initialized with fixed key");
    }

    public String generateToken(String userName, String role) {
        try {
            final var signer = new MACSigner(secretKey);
            final var claimsSet = new JWTClaimsSet.Builder()
                    .subject(userName)
                    .issuer(ConstSecurity.JWT.ISSUER)
                    .claim(ConstSecurity.JWT.CLAIM_ROLE, role)
                    .expirationTime(new Date(System.currentTimeMillis() + ConstSecurity.JWT.JWT_EXPIRATION_TIME))
                    .build();

            final var signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet
            );

            signedJWT.sign(signer);
            return signedJWT.serialize();
        } catch (JOSEException e) {
            Logger.error("Không thể tạo JWT cho account: " + userName + ", role: " + role, e);
        }
        return null;
    }

    public SignedJWT decodeToken(String token) throws MyJwtDecoderException {
        try {
            final var signedJWT = SignedJWT.parse(token);
            if (signedJWT.verify(new MACVerifier(secretKey)) == false) {
                return null;
            }
            return signedJWT;
        } catch (ParseException e) {
            throw new MyJwtDecoderException("Lỗi cú pháp JWT", e);
        } catch (JOSEException e) {
            throw new MyJwtDecoderException("Lỗi xác minh JWT", e);
        } catch (Exception e) {
            throw new MyJwtDecoderException("Lỗi không xác định", e);
        }
    }

}
