/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.entity;

import com.quickmeal.backend.constant.OrderStatus;
import com.quickmeal.backend.constant.PaymentMethod;
import com.quickmeal.backend.constant.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với User (Khách hàng)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private Double totalPrice;
    private String address;
    private String phone;
    private String note;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // Phương thức thanh toán (COD / VNPAY)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    // Trạng thái tiền: độc lập với OrderStatus (trạng thái vận hành bếp/giao hàng)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    // Mã giao dịch tự sinh, gửi cho VNPay để họ echo lại trong callback -> dùng tra cứu order
    @Column(name = "vnp_txn_ref", unique = true)
    private String vnpTxnRef;

    // Mã giao dịch do chính VNPay sinh ra, chỉ có sau khi thanh toán xong -> dùng cho refund/querydr
    @Column(name = "vnp_transaction_no")
    private String vnpTransactionNo;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItemEntity> items;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @CreationTimestamp
    private LocalDateTime updatedAt;
}
