/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.repo;

import com.quickmeal.backend.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

}
