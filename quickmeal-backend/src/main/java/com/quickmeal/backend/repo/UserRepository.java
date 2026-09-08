/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.repo;

import com.quickmeal.backend.entity.UserEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<UserEntity> findByUserName(String userName);

    Optional<UserEntity> findByUserNameOrEmailOrPhone(String userName, String email, String phone);

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByPhone(String phone);

    Page<UserEntity> findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
            String username,
            String email,
            String fullName,
            Pageable pageable
    );
}
