/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.service;

import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.dto.user.*;
import com.quickmeal.backend.entity.UserEntity;
import com.quickmeal.backend.repo.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Thêm import này
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UserResponseDTO> getUsers(Pageable pageable, String search) {

        Page<UserEntity> page;

        if (!StringUtils.hasText(search)) {
            // Không search → lấy toàn bộ (phân trang)
            page = userRepository.findAll(pageable);
        } else {
            // Có search → tìm theo keyword
            page = userRepository
                    .findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                            search, search, search, pageable
                    );
        }

        return page.map(this::toDTO);
    }

    // ✅ CREATE USER
    @Transactional // Đảm bảo giao dịch (transaction)
    public UserResponseDTO createUser(UserCreateDTO dto) {

        // 1. Kiểm tra tính duy nhất (Unique Constraints)
        if (userRepository.existsByUserName(dto.userName())) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        // 💡 FIX: Thêm kiểm tra unique phone
        if (userRepository.existsByPhone(dto.phone())) {
            throw new IllegalArgumentException("Số điện thoại đã tồn tại");
        }

        // 2. Validate và chuyển đổi role
        ConstAccount.Role role = ConstAccount.Role.fromName(dto.role());
        if (role == null) {
            throw new IllegalArgumentException("Vai trò không hợp lệ: " + dto.role());
        }

        // 3. Tạo Entity
        UserEntity user = new UserEntity();
        user.setUserName(dto.userName());
        // 💡 FIX: Mã hóa mật khẩu
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setRole(role);
        user.setEnabled(true); // Mặc định là enabled

        // 4. Save
        userRepository.save(user);
        return toDTO(user);
    }

    // ✅ UPDATE USER
    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateDTO dto) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 1. Kiểm tra tính duy nhất cho Email (chỉ kiểm tra nếu email thay đổi)
        if (!user.getEmail().equals(dto.email())) {
            Optional<UserEntity> existingEmailUser = userRepository.findByEmail(dto.email());
            if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(id)) {
                throw new RuntimeException("Email đã được sử dụng bởi người dùng khác");
            }
        }

        // 2. Kiểm tra tính duy nhất cho Phone (chỉ kiểm tra nếu phone thay đổi)
        if (!user.getPhone().equals(dto.phone())) {
            Optional<UserEntity> existingPhoneUser = userRepository.findByPhone(dto.phone());
            if (existingPhoneUser.isPresent() && !existingPhoneUser.get().getId().equals(id)) {
                throw new RuntimeException("Số điện thoại đã được sử dụng bởi người dùng khác");
            }
        }

        // 3. Validate và chuyển đổi role
        ConstAccount.Role role = ConstAccount.Role.fromName(dto.role());

        // 4. Cập nhật các trường
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setRole(role);
        user.setEnabled(dto.enabled());

        // 💡 FIX: Xử lý cập nhật MẬT KHẨU (nếu có)
        if (dto.password() != null && !dto.password().isEmpty()) {
            // Lưu ý: Validation độ dài đã được xử lý ở Controller/DTO
            user.setPassword(passwordEncoder.encode(dto.password()));
        }

        userRepository.save(user);
        return toDTO(user);
    }

    // ❗ Soft delete
    @Transactional
    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        user.setEnabled(false);
        userRepository.save(user);
    }

    private UserResponseDTO toDTO(UserEntity user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUserName(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.isEnabled()
        );
    }
}
