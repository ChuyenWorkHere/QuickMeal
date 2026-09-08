/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.dto;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public record ProductDTO(
        Long id,
        String name,
        String description,
        Double price,
        String imageUrl,
        Long categoryId,
        String categoryName,
        Integer stock
        ) {

}
