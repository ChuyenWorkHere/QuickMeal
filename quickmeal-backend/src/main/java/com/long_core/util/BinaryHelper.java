/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.util;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public final class BinaryHelper {

    public static int getShortValue(byte b1, byte b2) {
        return (b1 & 0xFF) << 8
                | b2 & 0xFF;
    }

    public static int getIntValue(byte b1, byte b2, byte b3, byte b4) {
        return (b1 & 0xFF) << 24
                | (b2 & 0xFF) << 16
                | (b3 & 0xFF) << 8
                | b4 & 0xFF;
    }

    public static long getLongValue(byte b1, byte b2, byte b3, byte b4,
            byte b5, byte b6, byte b7, byte b8) {
        return ((long) (b1 & 0xFF) << 56)
                | ((long) (b2 & 0xFF) << 48)
                | ((long) (b3 & 0xFF) << 40)
                | ((long) (b4 & 0xFF) << 32)
                | ((long) (b5 & 0xFF) << 24)
                | ((long) (b6 & 0xFF) << 16)
                | ((long) (b7 & 0xFF) << 8)
                | ((long) (b8 & 0xFF));
    }

}
