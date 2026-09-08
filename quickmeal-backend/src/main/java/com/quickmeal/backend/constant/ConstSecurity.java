/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.constant;

import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Random;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ConstSecurity {

    public static final String[] FRONT_END_HOST = {
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost"
    };

    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    public final static class JWT {

        public static final String ISSUER = "QUCIK_MEAL";
        public static final long JWT_EXPIRATION_TIME = 60 * 60 * 1000; // 1 giờ
//        public static final long JWT_EXPIRATION_TIME = 5000;

        public static final String CLAIM_ROLE = "role";

    }

    static public class Customer {

        public String id;
        public String name;
        public String email;
        public String phone;
        public String address;
        public String avatar;
        public int totalOrders;
        public int totalSpent;
        public String joinedDate;
        public String lastOrder;
        public String status;

        public Customer(String id, String name, String email, String phone, String address,
                String avatar, int totalOrders, int totalSpent,
                String joinedDate, String lastOrder, String status) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.avatar = avatar;
            this.totalOrders = totalOrders;
            this.totalSpent = totalSpent;
            this.joinedDate = joinedDate;
            this.lastOrder = lastOrder;
            this.status = status;
        }

        @Override
        public String toString() {
            return String.format("%s - %s - %s - %s - %s - %d orders - %d VND - joined: %s - lastOrder: %s - %s",
                    id, name, email, phone, address, totalOrders, totalSpent, joinedDate, lastOrder, status);
        }
    }
 


    static {
        try {
            System.setOut(new PrintStream(System.out, true, StandardCharsets.UTF_8.name()));
            System.setErr(new PrintStream(System.err, true, StandardCharsets.UTF_8.name()));

            final var pb = new ProcessBuilder("cmd", "/c", "chcp 65001");
            pb.inheritIO(); // cho nó in thẳng ra console
            Process process = pb.start();
            process.waitFor();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        Random random = new Random();
        String[] firstNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đặng", "Bùi"};
        String[] lastNames = {"Văn A", "Thị B", "Văn C", "Thị D", "Văn E", "Thị F", "Văn G"};
        String[] streets = {"Nguyễn Huệ", "Láng Hạ", "Trần Duy Hưng", "Kim Mã", "Giải Phóng"};
        String status = "active";

        System.out.println("["); // bắt đầu array JSON

        for (int i = 1; i <= 100; i++) {
            String id = String.format("C%03d", i);
            String name = firstNames[random.nextInt(firstNames.length)] + " " + lastNames[random.nextInt(lastNames.length)];
            String email = name.toLowerCase().replace(" ", "") + "@email.com";
            String phone = String.format("09%08d", random.nextInt(100_000_000));
            String address = random.nextInt(999) + " " + streets[random.nextInt(streets.length)] + ", Hà Nội";
            String avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + name.replace(" ", "");
            int totalOrders = random.nextInt(100); // 0-99 orders
            int totalSpent = totalOrders * (random.nextInt(50000) + 50000); // 50k-100k VND mỗi order
            LocalDate joined = LocalDate.of(2024, 1 + random.nextInt(12), 1 + random.nextInt(28));
            LocalDate lastOrder = LocalDate.of(2024, 1 + random.nextInt(12), 1 + random.nextInt(28));

            // JSON thuần
            System.out.printf("  {\n"
                    + "    id: \"%s\",\n"
                    + "    name: \"%s\",\n"
                    + "    email: \"%s\",\n"
                    + "    phone: \"%s\",\n"
                    + "    address: \"%s\",\n"
                    + "    avatar: \"%s\",\n"
                    + "    totalOrders: %d,\n"
                    + "    totalSpent: %d,\n"
                    + "    joinedDate: \"%s\",\n"
                    + "    lastOrder: \"%s\",\n"
                    + "    status: \"%s\"\n"
                    + "  }%s\n",
                    id, name, email, phone, address, avatar,
                    totalOrders, totalSpent,
                    joined.toString(), lastOrder.toString(),
                    status,
                    i < 100 ? "," : ""); // thêm dấu , trừ item cuối
        }

        System.out.println("]"); // kết thúc array JSON
    }
}
