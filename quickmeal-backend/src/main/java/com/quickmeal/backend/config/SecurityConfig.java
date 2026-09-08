/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.config;

import com.quickmeal.backend.config.jwt.MyJwtFilter;
import com.quickmeal.backend.config.jwt.MyJwtService;
import com.quickmeal.backend.constant.ConstAPI;
import com.quickmeal.backend.constant.ConstSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.IpAddressMatcher;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class SecurityConfig {

    private final MyJwtService jwtService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> {
                    session
                            // Không lưu session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                })
                .cors(cors -> {
                    cors
                            .configurationSource(request -> {
                                final var corsConfig = new CorsConfiguration();
                                corsConfig.setAllowedOrigins(Arrays.asList(ConstSecurity.FRONT_END_HOST));
                                corsConfig.setMaxAge(Long.MAX_VALUE);
                                corsConfig.addAllowedMethod("*");
                                corsConfig.addAllowedHeader("*");
                                corsConfig.setAllowCredentials(true);  // Hỗ trợ Cookie/Auth Token
                                return corsConfig;
                            });
                })
                .authorizeHttpRequests((authorizeHttpRequests) -> {
                    authorizeHttpRequests
                            // Actuator chỉ cho phép truy cập từ localhost
                            .requestMatchers("/actuator/**").access(
                            (authentication, context) -> {
                                final var request = context.getRequest();
                                final var isLocal = new IpAddressMatcher("127.0.0.1").matches(request)
                                || new IpAddressMatcher("::1").matches(request);
                                return new AuthorizationDecision(isLocal);
                            })
                            // Cho phép GET với các API công khai
                            .requestMatchers(HttpMethod.GET, ConstAPI.PUBLIC_GET_API).permitAll()
                            // Cho phép POST với các API công khai
                            .requestMatchers(HttpMethod.POST, ConstAPI.PUBLIC_POST_API).permitAll()
                            // Các request còn lại cần authentication
                            .anyRequest().authenticated();
                })
                .addFilterBefore(new MyJwtFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(
                        ex -> {
                            ex.accessDeniedHandler(customAccessDeniedHandler());
                            ex.authenticationEntryPoint(customAuthenticationEntryPoint());
                        }
                )
                .formLogin(
                        (formLoginConfig) -> {
                            formLoginConfig.disable();
                        }
                )
                .httpBasic(
                        (httpBasicConfig) -> {
                            httpBasicConfig.disable();
                        }
                );

        return http.build();
    }

    private AccessDeniedHandler customAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.getWriter().write("Access Denied: You do not have permission to access this resource");
            response.getWriter().flush();
        };
    }

    private AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Token đã hết hạn hoặc không hợp lệ, vui lòng đăng nhập lại");
            response.getWriter().flush();
            authException.printStackTrace();
        };
    }
}
