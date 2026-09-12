/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.dto.order;

import java.util.List;
import lombok.Data;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Data
public class OrderRequestDTO {

    private String userName;
    private String address;
    private String phone;
    private String note;
    // "COD" hoặc "VNPAY" - không truyền thì mặc định COD
    private String paymentMethod;
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {

        private Long productId;
        private Integer quantity;
    }
}
