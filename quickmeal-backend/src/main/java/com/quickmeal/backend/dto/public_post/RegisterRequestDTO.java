/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.dto.public_post;

import jakarta.validation.constraints.*;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public record RegisterRequestDTO(
        @NotBlank(message = "Username không được để trống")
        @Size(min = 3, max = 20, message = "Username từ 3-20 ký tự")
        String userName,
        @NotBlank(message = "Username không được để trống")
        @Size(min = 3, max = 20, message = "Username từ 3-20 ký tự")
        String fullName,
        //
        @NotBlank(message = "Password không được để trống")
        @Size(min = 6, message = "Mật khẩu ít nhất 6 ký tự")
        String password,
        //
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,
        //
        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^(\\+84|0)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
        String phone
        ) {

}
