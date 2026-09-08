/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.controller;

import com.quickmeal.backend.constant.ConstAPI;
import com.quickmeal.backend.constant.ConstAccount;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/all")
    public String all() {
        return "Hello ????!";
    }

    @GetMapping("/admin")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_ADMIN)
    public String adminOnly() {
        return "Hello Admin!";
    }

    @GetMapping("/staff")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_STAFF)
    public String stafOnly() {

        return "Hello Staff!";
    }

    @GetMapping("/customer")
    @PreAuthorize(ConstAccount.Role.HAS_AUTHORITY_CUSTOMER)
    public String customerOnly() {
        return "Hello Customer!";
    }

}
