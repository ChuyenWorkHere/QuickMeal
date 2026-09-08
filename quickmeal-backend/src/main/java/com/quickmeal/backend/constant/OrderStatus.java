/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.constant;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public enum OrderStatus {
    PENDING_ACCEPTANCE, // Đơn mới, chờ nhân viên bấm "Nhận đơn"
    PREPARING, // Bếp đang làm
    READY, // Đã xong, chờ giao/khách lấy
    SHIPPING, // Đang trên đường giao
    COMPLETED, // Hoàn tất
    CANCELLED, // Khách/Hệ thống hủy
    REJECTED            // Nhà hàng từ chối (hết nguyên liệu, quá tải...)
}
