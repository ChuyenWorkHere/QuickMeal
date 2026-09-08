/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.controller.auth;

import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.collection.jwt.JwtTokenWhiteList;
import com.quickmeal.backend.constant.ConstAPI;
import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.auth.LoginRequestDTO;
import com.quickmeal.backend.config.jwt.MyJwtService;
import com.quickmeal.backend.dto.ApiResponse;
import com.quickmeal.backend.dto.auth.LoginResponseDTO;
import com.quickmeal.backend.dto.user.UpdateProfileDTO;
import com.quickmeal.backend.dto.user.UserResponseDTO;
import com.quickmeal.backend.entity.UserEntity;
import com.quickmeal.backend.repo.UserRepository;
import com.quickmeal.backend.service.UserService;
import com.quickmeal.backend.util.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@AllArgsConstructor
@RequestMapping(ConstAPI.API_AUTH)
public class AuthController {

    private final UserService userService; // 👈 THAY ĐỔI: dùng UserService
    private final MyJwtService jwtService;
    private final UserRepository userRepository; // Vẫn giữ để dùng findByUserNameOrEmailOrPhone

    @PostMapping(ConstAPI.MAPPING_AUTH_LOGIN)
    public ResponseEntity<?> login(final @Valid @RequestBody LoginRequestDTO dto) {
        Logger.DebugLogic("User name: %s, pass: %s".formatted(dto.userName(), dto.password()));

        try {
            // Tìm user theo username, email hoặc phone
            final var userOpt = userRepository.findByUserNameOrEmailOrPhone(
                    dto.userName(),
                    dto.userName(),
                    dto.userName()
            );
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Tài khoản hoặc mật khẩu sai");
            }

            final var user = userOpt.get();


            if (!userService.validateLogin(dto.userName(), dto.password())) {
                return ApiResponse.error("Tài khoản hoặc mật khẩu sai");
            }
            if (user.isEnabled() == false) {
                return ApiResponse.error("Tài khoản hiện đã bị khóa, vui lòng liên hệ với quản trị viên");
            }

            final var token = jwtService.generateToken(user.getUserName(), user.getRole().name());

            JwtTokenWhiteList.addToken(token, user.getUserName());

            return ApiResponse.success(new LoginResponseDTO(
                    token, user.getRole().toString(), user.getUserName(), user.getFullName(), user.getEmail(), user.getPhone()
            ));
        } catch (Exception e) {
            Logger.error(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(ConstAPI.MAPPING_AUTH_LOGOUT)
    public void logout(final HttpServletRequest request) {
        try {
            final var token = TokenUtil.getTokenFromRequest(request);
            if (token == null) {
                return;
            }

            JwtTokenWhiteList.removeToken(token);
        } catch (Exception e) {
            Logger.error(e);
        }
    }

    // 👇 THÊM CÁC ENDPOINT MỚI CHO PROFILE
    @GetMapping("/profile")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_CUSTOMER)
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            var user = userService.getByUsername(username); // 👈 THAY ĐỔI: dùng UserService

            var response = new UserResponseDTO(
                    user.getId(),
                    user.getUserName(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole().name(),
                    user.isEnabled()
            );

            return ApiResponse.success(response);
        } catch (IllegalArgumentException e) {
            // Xử lý lỗi khi user không tồn tại
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            Logger.error("Lỗi khi lấy thông tin profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/profile")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_CUSTOMER)
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileDTO updateDTO,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            var updatedUser = userService.updateProfile(username, updateDTO); // 👈 THAY ĐỔI: dùng UserService

            var response = new UserResponseDTO(
                    updatedUser.getId(),
                    updatedUser.getUserName(),
                    updatedUser.getFullName(),
                    updatedUser.getEmail(),
                    updatedUser.getPhone(),
                    updatedUser.getRole().name(),
                    updatedUser.isEnabled()
            );

            return ApiResponse.success(response);

        } catch (IllegalArgumentException e) {
            // Xử lý lỗi validation từ service
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            Logger.error("Lỗi khi cập nhật profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
