/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.controller;

import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.constant.OrderStatus;
import com.quickmeal.backend.dto.order.OrderRequestDTO;
import com.quickmeal.backend.dto.order.OrderResponseDTO;
import com.quickmeal.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_STAFF)
    public Page<OrderResponseDTO> getOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            Pageable pageable
    ) {
        return orderService.getAllOrders(keyword, status, pageable);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_STAFF)
    public OrderResponseDTO updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    @PostMapping("/checkout")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_CUSTOMER)
    public OrderResponseDTO checkout(@RequestBody OrderRequestDTO dto) {
        if (dto.getUserName() == null || dto.getUserName().isBlank()) {
            throw new RuntimeException("Thiếu userName trong payload checkout");
        }
        return orderService.createOrder(dto);
    }

    @GetMapping("/my-orders")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_CUSTOMER)
    public Page<OrderResponseDTO> getMyOrders(
            @RequestParam String userName,
            @RequestParam(required = false, defaultValue = "ALL") String status, // Thêm tham số này
            Pageable pageable
    ) {
        // Truyền status vào service
        return orderService.getOrdersByCustomer(userName, status, pageable);
    }
}
