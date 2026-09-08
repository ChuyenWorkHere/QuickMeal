package com.quickmeal.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileDTO(
    
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2 đến 100 ký tự")
    String fullName,
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email,
    
    @Pattern(regexp = "^(0[0-9]{9,10})$", message = "Số điện thoại không hợp lệ")
    String phone,
    
    @Size(min = 6, max = 50, message = "Mật khẩu phải từ 6 đến 50 ký tự")
    String currentPassword,
    
    @Size(min = 6, max = 50, message = "Mật khẩu mới phải từ 6 đến 50 ký tự")
    String newPassword
) {}