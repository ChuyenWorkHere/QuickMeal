/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.util;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public final class Checker {

    public static boolean isJsonArray(String str) {
        if (str == null) {
            return false;
        }
        return str.startsWith("[") && str.endsWith("]");
    }

    public static boolean isJsonObject(String str) {
        if (str == null) {
            return false;
        }
        return str.startsWith("{") && str.endsWith("}");
    }

    public static boolean isJsonEmpty(String str) {
        if (str == null || str.length() < 2) {
            return true;
        }
        if ("{}".equals(str) || "[]".equals(str)) {
            return true;
        }
        return false;
    }

}
