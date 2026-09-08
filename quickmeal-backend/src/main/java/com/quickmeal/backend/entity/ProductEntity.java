/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * Sản phẩm (bánh mì, nước, combo)
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Entity
@Table(name = "products")
@Getter
@Setter
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên món
    @Column(nullable = false)
    private String name;

    // Mô tả
    @Column(columnDefinition = "TEXT")
    private String description;

    // Giá
    @Column(nullable = false)
    private Double price;

    // Link ảnh
    private String imageUrl;

    // Mỗi sản phẩm thuộc 1 category
    @ManyToOne(fetch = FetchType.LAZY)
    private CategoryEntity category;

    // Số lượng tồn kho (NULL = không theo dõi tồn)
    @Column(name = "stock")
    private Integer stock;
}
