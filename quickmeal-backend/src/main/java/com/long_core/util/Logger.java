/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.khanhdz_core.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
public final class Logger {

    private static final DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static String getCurrentTime() {
        return LocalDateTime.now().format(dtFormatter);
    }

    public static void DebugLogic(String message) {
        try {
            message += "\n\t==> at " + Thread.currentThread().getStackTrace()[2];
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("DEBUG>>>\t" + message);
    }

    public static void DebugLogic(String message, StackTraceElement stack) {
        try {
            message += "\n\t==> at " + stack;
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("DEBUG>>>\t" + message);
    }

    public static void DebugLogic(String message, Exception e) {
        System.err.println("ERROR>>> " + message);
        e.printStackTrace();
    }

    public static void printStackTrace() {
        System.out.println("DEBUG>>>\t\tBắt đầu printStackTrace");
        final var stackTrace = Thread.currentThread().getStackTrace();
        // In ra từng phần của stacktrace
        for (var element : stackTrace) {
            System.out.println("\tat " + element);
        }
    }

    public static void info(String message) {
        System.out.println("INFO>>>\n" + message + "\n>>>at " + Thread.currentThread().getStackTrace()[2]);
    }

    public static void warn(String message) {
        System.out.println("WARN>>>\n" + message + "\n>>>at " + Thread.currentThread().getStackTrace()[2]);
    }

    public static void error(Throwable e) {
        System.err.println("ERROR>>> \tat " + Thread.currentThread().getStackTrace()[2].toString());
        if (e != null) {
            e.printStackTrace();
        }
    }

    public static void error(String message, Throwable e) {
        System.err.println("ERROR>>> " + message + "\n\tat " + Thread.currentThread().getStackTrace()[2].toString());
        if (e != null) {
            e.printStackTrace();
        }
    }

    public static void error(String message, Throwable e, StackTraceElement stack) {
        System.err.println("ERROR>>> " + message + "\n\tat " + stack.toString());
        if (e != null) {
            e.printStackTrace();
        }
    }

    public static void fatal(String message) {
        System.err.println("FATAL>>> " + message + "\n\tat " + Thread.currentThread().getStackTrace()[2].toString());
        System.exit(0);
    }

    public static void fatal(Exception e) {
        System.err.println("FATAL>>> ");
        if (e != null) {
            e.printStackTrace();
        }
        System.exit(0);
    }

    public static void fatal(String message, Exception e) {
        System.err.println("FATAL>>> " + message);
        if (e != null) {
            e.printStackTrace();
        }
        System.exit(0);
    }

}
