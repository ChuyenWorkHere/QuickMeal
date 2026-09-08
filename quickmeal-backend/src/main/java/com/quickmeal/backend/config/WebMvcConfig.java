/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.config;

import java.nio.file.Files;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        try {
            // Lấy thư mục chạy hiện tại và folder gốc uploads
            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");

            // Tạo folder uploads nếu chưa tồn tại
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("▶ Folder uploads được tạo: " + uploadDir.toAbsolutePath());
            }

            // Serve tất cả folder /uploads/** qua URL
            String uploadPath = uploadDir.toUri().toString();
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(uploadPath);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("❌ Lỗi khi tạo folder uploads hoặc category", e);
        }
    }
}
