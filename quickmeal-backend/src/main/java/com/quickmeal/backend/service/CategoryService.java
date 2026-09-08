/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.service;

import com.quickmeal.backend.entity.CategoryEntity;
import com.quickmeal.backend.repo.CategoryRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepo;

    // Tạo mới nếu chưa tồn tại
    public CategoryEntity createIfNotExist(String name) {
        if (categoryRepo.existsByName(name)) {
            return categoryRepo.findAll()
                    .stream()
                    .filter(c -> c.getName().equals(name))
                    .findFirst()
                    .orElseThrow();
        }

        CategoryEntity c = new CategoryEntity();
        c.setName(name);
        return categoryRepo.save(c);
    }

    public List<CategoryEntity> getAll() {
        return categoryRepo.findAll();
    }

    public CategoryEntity getById(Long id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public CategoryEntity update(Long id, String name) {
        CategoryEntity cat = getById(id);
        cat.setName(name);
        return categoryRepo.save(cat);
    }

    public void delete(Long id) {
        categoryRepo.deleteById(id);
    }
}
