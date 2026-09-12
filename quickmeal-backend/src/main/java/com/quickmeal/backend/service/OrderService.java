/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.service;

import com.quickmeal.backend.constant.OrderStatus;
import com.quickmeal.backend.constant.PaymentMethod;
import com.quickmeal.backend.constant.PaymentStatus;
import com.quickmeal.backend.dto.order.OrderRequestDTO;
import com.quickmeal.backend.dto.order.OrderResponseDTO;
import com.quickmeal.backend.entity.*;
import com.quickmeal.backend.exception.BusinessException;
import com.quickmeal.backend.repo.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VNPayService vnPayService;

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getAllOrders(String keyword, String statusStr, Pageable pageable) {
        String searchKeyword = StringUtils.hasText(keyword) ? keyword : "";

        // Chuyển từ String sang Enum, nếu là "ALL" hoặc null thì để null để Repo không filter
        OrderStatus status = null;
        if (StringUtils.hasText(statusStr) && !"ALL".equalsIgnoreCase(statusStr)) {
            try {
                status = OrderStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                // Log warning nếu status gửi lên không hợp lệ
                status = null;
            }
        }

        return orderRepository.searchOrdersAdvanced(searchKeyword, status, pageable)
                .map(this::convertToDTO);
    }

    private OrderResponseDTO convertToDTO(OrderEntity entity) {
        return OrderResponseDTO.builder()
                .id(entity.getId())
                .customerName(entity.getUser().getFullName())
                .userName(entity.getUser().getUserName())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .note(entity.getNote())
                .totalPrice(entity.getTotalPrice())
                .status(entity.getStatus())
                .paymentMethod(entity.getPaymentMethod())
                .paymentStatus(entity.getPaymentStatus())
                .createdAt(entity.getCreatedAt())
                .items(entity.getItems().stream()
                        .map(item -> OrderResponseDTO.OrderItemDTO.builder()
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO dto) {
        UserEntity user = userRepository.findByUserName(dto.getUserName())
                .orElseThrow(() -> new BusinessException("User không tồn tại: " + dto.getUserName()));

        OrderEntity order = OrderEntity.builder()
                .user(user)
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .note(dto.getNote())
                .status(OrderStatus.PENDING_ACCEPTANCE)
                .paymentMethod(parsePaymentMethod(dto.getPaymentMethod()))
                .paymentStatus(PaymentStatus.UNPAID)
                .totalPrice(0.0)
                .build();

        List<OrderItemEntity> items = dto.getItems().stream().map(itemDto -> {
            ProductEntity product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new BusinessException("Sản phẩm ID " + itemDto.getProductId() + " không tồn tại"));
            // Kiểm tra tồn kho (nếu có)
            Integer stock = product.getStock();
            if (stock != null) {
                if (stock < itemDto.getQuantity()) {
                    throw new BusinessException("Sản phẩm '" + product.getName() + "' chỉ còn " + stock + " cái. Vui lòng điều chỉnh số lượng.");
                }
                // trừ tồn
                product.setStock(stock - itemDto.getQuantity());
                productRepository.save(product);
            }

            return OrderItemEntity.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(product.getPrice())
                    .build();
        }).toList();

        double total = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
        order.setTotalPrice(total);
        order.setItems(items);

        OrderEntity savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    @Transactional
    public OrderResponseDTO updateStatus(Long orderId, OrderStatus newStatus) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng"));

        final boolean isCancelLike = newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.REJECTED;

        // Đơn VNPay chưa thanh toán (paymentStatus != PAID) thì chưa được đẩy đi tiếp -
        // tránh trường hợp bếp chuẩn bị món cho đơn khách bỏ ngang chưa trả tiền
        if (!isCancelLike && order.getPaymentMethod() == PaymentMethod.VNPAY
                && order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BusinessException("Đơn hàng chưa thanh toán, chưa thể xử lý");
        }

        // Đơn VNPay đã PAID thì không được hủy tay bình thường - bắt buộc đi qua luồng
        // hủy + hoàn tiền (cancelWithRefund) để tiền thật được hoàn lại đúng cách
        if (isCancelLike && order.getPaymentMethod() == PaymentMethod.VNPAY
                && order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException("Đơn đã thanh toán qua VNPay, vui lòng dùng chức năng hủy & hoàn tiền");
        }

        if (isCancelLike && order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.REJECTED) {
            restoreStock(order);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        OrderEntity savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    /**
     * Hủy 1 đơn VNPay đã PAID kèm hoàn tiền thật qua VNPay. Controller chỉ nên cho phép
     * ADMIN gọi (tác động tới tiền thật, không nên để STAFF tự ý hoàn tiền).
     */
    @Transactional
    public OrderResponseDTO cancelWithRefund(Long orderId, String performedBy) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng"));
        vnPayService.refundOrder(order, performedBy);
        return convertToDTO(order);
    }

    private PaymentMethod parsePaymentMethod(String raw) {
        if (!StringUtils.hasText(raw)) {
            return PaymentMethod.COD;
        }
        try {
            return PaymentMethod.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Phương thức thanh toán không hợp lệ: " + raw);
        }
    }

    private void restoreStock(OrderEntity order) {
        for (OrderItemEntity item : order.getItems()) {
            final ProductEntity product = item.getProduct();
            if (product.getStock() != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getOrdersByCustomer(String userName, String statusStr, Pageable pageable) {
        if (!userRepository.existsByUserName(userName)) {
            throw new BusinessException("Người dùng không tồn tại: " + userName);
        }

        // Logic chuyển đổi Status chuỗi sang Enum
        OrderStatus status = null;
        if (StringUtils.hasText(statusStr) && !"ALL".equalsIgnoreCase(statusStr)) {
            try {
                status = OrderStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                status = null; // Nếu sai enum thì mặc định coi như lấy ALL
            }
        }

        return orderRepository.findByUserNameAndStatus(userName, status, pageable)
                .map(this::convertToDTO);
    }
}
