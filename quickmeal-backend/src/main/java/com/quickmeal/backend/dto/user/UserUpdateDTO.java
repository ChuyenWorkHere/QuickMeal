/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.dto.user;

import jakarta.validation.constraints.*;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public record UserUpdateDTO(
        @NotBlank(message = "Họ tên không được để trống")
        @Size(min = 3, max = 50, message = "Họ tên từ 3-50 ký tự")
        String fullName,
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,
        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^(\\+84|0)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
        String phone,
        // Mật khẩu là tùy chọn khi cập nhật. 
        // @Size chỉ kiểm tra nếu giá trị không phải null hoặc empty string.
        @Size(min = 6, message = "Mật khẩu mới ít nhất 6 ký tự")
        String password, // 💡 THÊM: Cho phép cập nhật mật khẩu

        @NotNull(message = "Vai trò không được để trống")
        String role,
        @NotNull(message = "Trạng thái kích hoạt không được để trống")
        Boolean enabled
        ) {

}
