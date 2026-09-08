/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.service;

import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.user.UpdateProfileDTO;
import com.quickmeal.backend.entity.UserEntity;
import com.quickmeal.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity registerUser(String userName, String fullName, String email, String phone, String rawPassword, ConstAccount.Role role) {
        final var user = new UserEntity();
        user.setUserName(userName);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    // 👇 THÊM CÁC METHOD MỚI
    
    public UserEntity getByUsername(String username) {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + username));
    }
    
    public UserEntity getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại với ID: " + id));
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUserName(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }
    
    public UserEntity updateProfile(String username, UpdateProfileDTO updateDTO) {
        UserEntity user = getByUsername(username);
        
        // Kiểm tra email có bị trùng với người khác không
        if (!user.getEmail().equals(updateDTO.email())) {
            Optional<UserEntity> existingUserWithEmail = userRepository.findByEmail(updateDTO.email());
            if (existingUserWithEmail.isPresent() && 
                !existingUserWithEmail.get().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Email đã được sử dụng bởi người dùng khác");
            }
        }
        
        // Kiểm tra phone có bị trùng với người khác không
        if (!user.getPhone().equals(updateDTO.phone())) {
            Optional<UserEntity> existingUserWithPhone = userRepository.findByPhone(updateDTO.phone());
            if (existingUserWithPhone.isPresent() && 
                !existingUserWithPhone.get().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Số điện thoại đã được sử dụng bởi người dùng khác");
            }
        }
        
        // Cập nhật thông tin cơ bản
        user.setFullName(updateDTO.fullName());
        user.setEmail(updateDTO.email());
        user.setPhone(updateDTO.phone());
        
        // Cập nhật mật khẩu nếu có
        if (updateDTO.currentPassword() != null && !updateDTO.currentPassword().isEmpty()) {
            if (updateDTO.newPassword() == null || updateDTO.newPassword().isEmpty()) {
                throw new IllegalArgumentException("Mật khẩu mới không được để trống");
            }
            
            // Kiểm tra mật khẩu hiện tại
            if (!passwordEncoder.matches(updateDTO.currentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
            }
            
            // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
            if (passwordEncoder.matches(updateDTO.newPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu cũ");
            }
            
            // Cập nhật mật khẩu mới
            user.setPassword(passwordEncoder.encode(updateDTO.newPassword()));
        }
        
        return userRepository.save(user);
    }
    
    public UserEntity updateUserRole(Long userId, ConstAccount.Role newRole) {
        UserEntity user = getById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }
    
    public UserEntity toggleUserStatus(Long userId) {
        UserEntity user = getById(userId);
        user.setEnabled(!user.isEnabled());
        return userRepository.save(user);
    }
    
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Người dùng không tồn tại với ID: " + userId);
        }
        userRepository.deleteById(userId);
    }
    
    public boolean validateLogin(String username, String password) {
        Optional<UserEntity> userOpt = userRepository.findByUserName(username);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        UserEntity user = userOpt.get();
        return passwordEncoder.matches(password, user.getPassword());
    }
}