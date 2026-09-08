/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.exception;

import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex) {
        final var errors = new HashMap<String, String>();
        for (var fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ApiResponse.create(ApiResponse.Code.INVALID_PARAM, errors);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AuthorizationDeniedException ex, HttpServletRequest request) {
        Logger.error(">>>> Access Denied: Path: " + request.getRequestURI(), null);
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Bạn không có quyền truy cập API này.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        Logger.error(">>>> handleMethodNotSupported: Path: " + request.getRequestURI(), null);

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body("Phương thức HTTP không được hỗ trợ cho API này");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNoResourceFoundException(NoResourceFoundException ex, HttpServletRequest exchange) {
        Logger.error(">>>> handleNoResourceFoundException: Path: " + exchange.getRequestURI(), null);

        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body("API không hợp lệ");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex, HttpServletRequest exchange) {
        Logger.error(">>>> handleGlobalException: Path: " + exchange.getRequestURI(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau hoặc liên hệ quản trị viên.");
    }

}
