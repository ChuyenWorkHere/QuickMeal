/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.ResponseEntity;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 * @param <T>
 */
@Data
@AllArgsConstructor
@Builder(access = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public final class ApiResponse<T> {

    public static class Code {

        public static final int SUCCESS = 0;
        public static final int ERROR = 1;
        public static final int INVALID_PARAM = 2;
    }

    private Integer code;
    private T data;

    public static <T> ResponseEntity<ApiResponse<T>> create(int code, T data) {
        return ResponseEntity.ok(
                ApiResponse.<T>builder()
                        .code(code)
                        .data(data)
                        .build()
        );
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(
                ApiResponse.<T>builder()
                        .code(Code.SUCCESS)
                        .data(data)
                        .build()
        );
    }

    public static ResponseEntity<ApiResponse<String>> error(String message) {
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .code(Code.ERROR)
                        .data(message)
                        .build()
        );
    }
}
