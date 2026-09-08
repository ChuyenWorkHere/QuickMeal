/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.util;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public final class Parser {

    public static int getIntegerValue(long value) {
        if (value >= Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }
        return (int) value;
    }
}
