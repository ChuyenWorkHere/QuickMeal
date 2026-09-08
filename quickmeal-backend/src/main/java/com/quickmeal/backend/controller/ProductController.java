/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.controller;

import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.ProductDTO;
import com.quickmeal.backend.entity.ProductEntity;
import com.quickmeal.backend.service.CategoryService;
import com.quickmeal.backend.service.ProductService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    // Lấy tất cả sản phẩm
    @GetMapping
    public List<ProductDTO> getAll() {
        return productService.getAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Lấy 1 sản phẩm
    @GetMapping("/{id}")
    public ProductDTO getOne(@PathVariable Long id) {
        return toDTO(productService.getById(id));
    }

    @GetMapping("/special")
    public List<ProductDTO> getSpecialProducts() {
        int NUM_ITEMS_TO_PICK = 6;
        return productService.getRandomSpecial(NUM_ITEMS_TO_PICK)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Tạo mới sản phẩm
    @PostMapping
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_STAFF)
    public ProductDTO create(@RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam Long categoryId,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) Integer stock) throws IOException {

        var category = categoryService.getById(categoryId);

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            // Lấy extension gốc
            String originalFilename = StringUtils.cleanPath(image.getOriginalFilename());
            String ext = "";

            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                ext = originalFilename.substring(dotIndex);
            }

            // Tạo tên file mới bằng UUID
            String filename = UUID.randomUUID().toString() + ext;

            // Tạo folder category nếu chưa tồn tại
            Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads", category.getName());
            Files.createDirectories(uploadPath);

            // Lưu file
            Path filePath = uploadPath.resolve(filename);
            image.transferTo(filePath);

            // URL lưu vào DB
            imageUrl = "/uploads/" + category.getName() + "/" + filename;
        }
        var product = productService.create(name, description, price, imageUrl, category, stock);
        return toDTO(product);
    }

    // Update sản phẩm
    @PutMapping("/{id}")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_STAFF)
    public ProductDTO update(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam Long categoryId,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) Integer stock
    ) throws IOException {

        var category = categoryService.getById(categoryId);
        ProductEntity product = productService.getById(id);

        String imageUrl = product.getImageUrl(); // ảnh cũ

        if (image != null && !image.isEmpty()) {
            // Xóa file cũ nếu có
            if (imageUrl != null) {
                Path oldPath = Paths.get(System.getProperty("user.dir"), imageUrl.substring(1)); // bỏ dấu '/'
                Files.deleteIfExists(oldPath);
            }

            // Lấy extension gốc
            String originalFilename = StringUtils.cleanPath(image.getOriginalFilename());
            String ext = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                ext = originalFilename.substring(dotIndex);
            }

            // Tạo tên file mới bằng UUID
            String filename = UUID.randomUUID().toString() + ext;

            // Tạo folder category nếu chưa tồn tại
            Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads", category.getName());
            Files.createDirectories(uploadPath);

            // Lưu file mới
            Path filePath = uploadPath.resolve(filename);
            image.transferTo(filePath);

            // Cập nhật URL mới
            imageUrl = "/uploads/" + category.getName() + "/" + filename;
        }

        // Update product
        product = productService.update(
            id,
            name,
            description,
            price,
            imageUrl,
            category,
            stock
        );

        return toDTO(product);
    }

    // Xóa sản phẩm + ảnh
    @DeleteMapping("/{id}")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_ADMIN)
    public void delete(@PathVariable Long id) throws IOException {
        // Lấy product trước
        ProductEntity product = productService.getById(id);

        // Xóa file ảnh nếu có
        String imageUrl = product.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            Path imagePath = Paths.get(System.getProperty("user.dir"), imageUrl.substring(1)); // bỏ dấu '/'
            Files.deleteIfExists(imagePath);
        }

        // Xóa product khỏi DB
        productService.delete(id);
    }

    private ProductDTO toDTO(ProductEntity p) {
        return new ProductDTO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null
                , p.getStock()
        );
    }
}
