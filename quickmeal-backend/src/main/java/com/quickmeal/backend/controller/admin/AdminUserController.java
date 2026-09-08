/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.controller.admin;

import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.user.*;
import com.quickmeal.backend.service.UserAdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.quickmeal.backend.dto.ApiResponse;
import com.khanhdz_core.util.Logger;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_ADMIN)
public class AdminUserController {

    private final UserAdminService userAdminService;

    public AdminUserController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping
    public Page<UserResponseDTO> getUsers(
            @PageableDefault(size = 10, sort = "id") Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        return userAdminService.getUsers(pageable, search);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateDTO dto) {
        try {
            UserResponseDTO user = userAdminService.createUser(dto);
            return ApiResponse.success(user);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            Logger.error("Lỗi tạo user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO dto) {
        try {
            UserResponseDTO user = userAdminService.updateUser(id, dto);
            return ApiResponse.success(user);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            Logger.error("Lỗi cập nhật user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userAdminService.deleteUser(id);
            return ApiResponse.success("Xóa user thành công");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            Logger.error("Lỗi xóa user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
