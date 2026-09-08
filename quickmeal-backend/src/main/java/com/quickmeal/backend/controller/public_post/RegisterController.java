/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.controller.public_post;

import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.collection.jwt.JwtTokenWhiteList;
import com.quickmeal.backend.config.jwt.MyJwtService;
import com.quickmeal.backend.constant.ConstAPI;
import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.ApiResponse;
import com.quickmeal.backend.dto.public_post.RegisterRequestDTO;
import com.quickmeal.backend.dto.public_post.RegisterResponseDTO;
import com.quickmeal.backend.repo.UserRepository;
import com.quickmeal.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@AllArgsConstructor
public class RegisterController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final MyJwtService jwtService;

    @PostMapping(ConstAPI.API_PUBLIC + "/register")
    public ResponseEntity<?> register(final @Valid @RequestBody RegisterRequestDTO request) {
        try {
            if (userRepository.existsByUserName(request.userName())) {
                return ApiResponse.error("Username đã tồn tại");
            }
            if (userRepository.existsByEmail(request.email())) {
                return ApiResponse.error("Email đã được sử dụng");
            }
            if (userRepository.existsByPhone(request.phone())) {
                return ApiResponse.error("Số điện thoại đã được sử dụng");
            }

            // Tạo user bằng service
            final var user = userService.registerUser(
                    request.userName(),
                    request.fullName(),
                    request.email(),
                    request.phone(),
                    request.password(),
                    ConstAccount.Role.CUSTOMER
            );

            final var token = jwtService.generateToken(user.getUserName(), user.getRole().name());

            final var dto = new RegisterResponseDTO(
                    user.getUserName(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole().toString(),
                    token
            );

            JwtTokenWhiteList.addToken(token, user.getUserName());

            return ApiResponse.success(dto);
        } catch (Exception e) {
            Logger.error(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
