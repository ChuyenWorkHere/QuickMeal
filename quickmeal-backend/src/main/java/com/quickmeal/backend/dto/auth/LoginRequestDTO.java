/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public record LoginRequestDTO(
        @NotBlank(message = "Username không được để trống")
        String userName,
        @NotBlank(message = "Password không được để trống")
        String password
        ) {

}
