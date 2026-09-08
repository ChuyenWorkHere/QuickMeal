/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.repo;

import com.quickmeal.backend.constant.OrderStatus;
import com.quickmeal.backend.entity.OrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // Lấy danh sách đơn hàng phân trang, sắp xếp theo thời gian mới nhất
    Page<OrderEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT o FROM OrderEntity o WHERE "
            + "(:status IS NULL OR o.status = :status) AND ("
            + "STR(o.id) LIKE %:keyword% OR "
            + "LOWER(o.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
            + "o.phone LIKE %:keyword% OR "
            + "LOWER(o.address) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<OrderEntity> searchOrdersAdvanced(
            @Param("keyword") String keyword,
            @Param("status") OrderStatus status,
            Pageable pageable
    );

    @Query("SELECT o FROM OrderEntity o WHERE o.user.userName = :userName "
            + "AND (:status IS NULL OR o.status = :status)")
    Page<OrderEntity> findByUserNameAndStatus(
            @Param("userName") String userName,
            @Param("status") OrderStatus status,
            Pageable pageable
    );
}
