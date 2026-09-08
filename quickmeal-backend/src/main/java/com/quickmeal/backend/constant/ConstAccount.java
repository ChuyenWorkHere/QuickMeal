/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.constant;

import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ConstAccount {

    public static enum Permission {
        USER_CREATE,
        USER_READ,
        USER_UPDATE,
        USER_DELETE,
        //
        MENU_CREATE,
        MENU_READ,
        MENU_UPDATE,
        MENU_DELETE,
        //
        ORDER_CREATE,
        ORDER_READ,
        ORDER_UPDATE,
        ORDER_DELETE,
        //
        REPORT_READ
    }

    /**
     * Map role -> permission set in RAM
     */
    private static final Map<Role, Set<Permission>> ROLE_PERMISSIONS;

    static {
        Map<Role, Set<Permission>> map = new EnumMap<>(Role.class);

        // Admin full quyền
        map.put(Role.ADMIN, EnumSet.allOf(Permission.class));

        // Staff chỉ quản lý menu & order
        map.put(Role.STAFF, EnumSet.of(
                Permission.MENU_CREATE,
                Permission.MENU_READ,
                Permission.MENU_UPDATE,
                Permission.ORDER_READ,
                Permission.ORDER_UPDATE
        ));

        // Customer chỉ tạo đơn & xem đơn của mình
        map.put(Role.CUSTOMER, EnumSet.of(
                Permission.ORDER_CREATE,
                Permission.ORDER_READ
        ));

        ROLE_PERMISSIONS = Collections.unmodifiableMap(map);
    }

    /**
     * Kiểm tra role có quyền permission không
     *
     * @param role
     * @param permission
     * @return
     */
    public static boolean hasPermission(Role role, Permission permission) {
        final var set = ROLE_PERMISSIONS.get(role);
        return set != null && set.contains(permission);
    }

    @Getter
    public static enum Role {
        CUSTOMER(0),
        STAFF(1),
        ADMIN(2);

        // ---------------------------
        // Các constant string dùng cho @PreAuthorize
        // ---------------------------
        public static final String HAS_AUTHORITY_ADMIN = "hasAnyAuthority('ADMIN')";
        public static final String HAS_AUTHORITY_STAFF = "hasAnyAuthority('ADMIN','STAFF')";
        public static final String HAS_AUTHORITY_CUSTOMER = "hasAnyAuthority('ADMIN','STAFF','CUSTOMER')";

        @Getter
        private final int code;

        Role(int code) {
            this.code = code;
        }

        public static Role fromCode(int code) {
            for (var r : values()) {
                if (r.code == code) {
                    return r;
                }
            }
            return null;
        }

        public static Role fromName(String name) {
            if (name == null) {
                return null;
            }
            final var upper = name.toUpperCase();
            for (var r : values()) {
                if (r.name().equals(upper)) {
                    return r;
                }
            }
            return null;
        }

    }

}
