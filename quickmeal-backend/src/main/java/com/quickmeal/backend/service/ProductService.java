/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.service;

import com.quickmeal.backend.entity.CategoryEntity;
import com.quickmeal.backend.entity.ProductEntity;
import com.quickmeal.backend.repo.ProductRepository;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryService categoryService;

    public List<ProductEntity> getRandomSpecial(int limit) {
        var allProducts = getAll(); // lấy toàn bộ sản phẩm
        Collections.shuffle(allProducts); // xáo trộn
        return allProducts.stream()
                .limit(limit) // chỉ lấy limit món
                .collect(Collectors.toList());
    }

    // Tạo sản phẩm
    public ProductEntity create(String name, String desc, double price, String img, CategoryEntity category, Integer stock) {
        ProductEntity p = new ProductEntity();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setImageUrl(img);
        p.setCategory(category);
        p.setStock(stock);
        return productRepo.save(p);
    }

    // Backwards-compatible overload
    public ProductEntity create(String name, String desc, double price, String img, CategoryEntity category) {
        return create(name, desc, price, img, category, null);
    }

    public List<ProductEntity> getAll() {
        return productRepo.findAll();
    }

    public ProductEntity getById(Long id) {
        return productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public ProductEntity update(Long id, String name, String desc, double price, String img, CategoryEntity cat, Integer stock) {
        ProductEntity p = getById(id);

        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setImageUrl(img);
        p.setCategory(cat);
        if (stock != null) p.setStock(stock);

        return productRepo.save(p);
    }

    // Backwards-compatible overload
    public ProductEntity update(Long id, String name, String desc, double price, String img, CategoryEntity cat) {
        return update(id, name, desc, price, img, cat, null);
    }

    public void delete(Long id) {
        productRepo.deleteById(id);
    }

}
