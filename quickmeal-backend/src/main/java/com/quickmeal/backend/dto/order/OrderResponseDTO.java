/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.dto.order;

import com.quickmeal.backend.constant.OrderStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Data
@Builder
public class OrderResponseDTO {

    private Long id;
    private String customerName;
    private String userName;
    private String phone;
    private String address;
    private String note;
    private Double totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;

    @Data
    @Builder
    public static class OrderItemDTO {

        private String productName;
        private Integer quantity;
        private Double price;
    }
}
