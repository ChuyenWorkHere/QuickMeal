/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.config.jwt;

import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.collection.jwt.JwtTokenWhiteList;
import com.quickmeal.backend.constant.ConstAPI;
import com.quickmeal.backend.constant.ConstSecurity;
import com.quickmeal.backend.exception.impl.MyJwtDecoderException;
import com.quickmeal.backend.util.TokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Component
@AllArgsConstructor
public class MyJwtFilter extends OncePerRequestFilter {

    private final MyJwtService jwtService;

    private final AntPathMatcher matcher = new AntPathMatcher();

    private void response(HttpServletResponse response, int sc, String s) throws IOException {
        response.setStatus(sc);
        response.getWriter().write(s);
    }

    // MyJwtFilter.java
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        final var path = request.getRequestURI();
        final var method = request.getMethod(); // <-- Lấy phương thức HTTP

        // 1. Kiểm tra Actuator
        if (path.startsWith("/actuator")) {
            return true;
        }

        // 2. Kiểm tra API GET công khai
        if (HttpMethod.GET.matches(method)) { // <-- Chỉ kiểm tra nếu là GET
            for (var publicGet : ConstAPI.PUBLIC_GET_API) {
                if (matcher.match(publicGet, path)) {
                    return true; // Bỏ qua bộ lọc nếu là GET và khớp với PUBLIC_GET_API
                }
            }
        }

        // 3. Kiểm tra API POST công khai
        if (HttpMethod.POST.matches(method)) { // <-- Chỉ kiểm tra nếu là POST
            for (var publicPost : ConstAPI.PUBLIC_POST_API) {
                if (matcher.match(publicPost, path)) {
                    return true; // Bỏ qua bộ lọc nếu là POST và khớp với PUBLIC_POST_API
                }
            }
        }

        // 4. Các phương thức khác (PUT, DELETE, PATCH, v.v.)
        // Nếu request không khớp với bất kỳ điều kiện công khai nào ở trên,
        // phải áp dụng bộ lọc JWT.
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {

        final var token = TokenUtil.getTokenFromRequest(request);

        if (token == null) {
            this.response(response, HttpServletResponse.SC_UNAUTHORIZED, "Không tìm thấy token");
            return;
        }

        try {
            final var signedJWT = jwtService.decodeToken(token);
            if (signedJWT == null) {
                this.response(response, HttpServletResponse.SC_UNAUTHORIZED, "Token không hợp lệ");
                return;
            }
            final var claimsSet = signedJWT.getJWTClaimsSet();

            if (claimsSet.getExpirationTime() != null && claimsSet.getExpirationTime().before(new java.util.Date())) {
                this.response(response, HttpServletResponse.SC_UNAUTHORIZED, "Token đã hết hạn");
                return;
            }

            final var username = claimsSet.getSubject();
            final var role = claimsSet.getStringClaim(ConstSecurity.JWT.CLAIM_ROLE);

            Logger.DebugLogic("kiểm tra token nào ????: user: %s, token: %s".formatted(username, token));

            if (JwtTokenWhiteList.isTokenWhitelisted(token, username) == false) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token không tồn tại hoặc đã hết hạn");
                return;
            }

            final var userDetails = User.builder()
                    .username(username)
                    .password("") // Không cần password
                    .authorities(List.of(new SimpleGrantedAuthority(role)))
                    .build();

            final var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (MyJwtDecoderException e) {
            Logger.error("JWT không hợp lệ: ", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("JWT không hợp lệ");
            return;
        } catch (Exception e) {
            Logger.error("Lỗi xử lý JWT", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Lỗi xử lý JWT");
            return;
        }

        // Tiếp tục với filter chain nếu không có lỗi
        chain.doFilter(request, response);
    }

}
