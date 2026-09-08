/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.controller;

import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.CategoryDTO;
import com.quickmeal.backend.entity.CategoryEntity;
import com.quickmeal.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Controller quản lý danh mục sản phẩm
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // Lấy tất cả danh mục
    @GetMapping
    public List<CategoryDTO> getAll() {
        return categoryService.getAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Lấy 1 danh mục theo id
    @GetMapping("/{id}")
    public CategoryDTO getOne(@PathVariable Long id) {
        return toDTO(categoryService.getById(id));
    }

    // Tạo mới danh mục
    @PostMapping
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_STAFF)
    public CategoryDTO create(@RequestBody CategoryDTO dto) {
        CategoryEntity cat = categoryService.createIfNotExist(dto.name());
        return toDTO(cat);
    }

    // Update danh mục
    @PutMapping("/{id}")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_STAFF)
    public CategoryDTO update(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        CategoryEntity cat = categoryService.update(id, dto.name());
        return toDTO(cat);
    }

    // Xóa danh mục
    @DeleteMapping("/{id}")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_ADMIN)
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }

    // Chuyển Entity -> DTO
    private CategoryDTO toDTO(CategoryEntity cat) {
        return new CategoryDTO(cat.getId(), cat.getName());
    }
}
