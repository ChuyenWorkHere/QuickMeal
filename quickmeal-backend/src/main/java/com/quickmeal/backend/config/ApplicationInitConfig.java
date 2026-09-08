/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.quickmeal.backend.config;

import com.khanhdz_core.util.Logger;
import com.quickmeal.backend.constant.ConstAccount;
import com.quickmeal.backend.constant.OrderStatus;
import com.quickmeal.backend.dto.order.OrderRequestDTO;
import com.quickmeal.backend.dto.order.OrderResponseDTO;
import com.quickmeal.backend.entity.CategoryEntity;
import com.quickmeal.backend.entity.OrderEntity;
import com.quickmeal.backend.entity.ProductEntity;
import com.quickmeal.backend.entity.UserEntity;
import com.quickmeal.backend.repo.OrderRepository;
import com.quickmeal.backend.repo.ProductRepository;
import com.quickmeal.backend.repo.UserRepository;
import com.quickmeal.backend.service.CategoryService;
import com.quickmeal.backend.service.OrderService;
import com.quickmeal.backend.service.ProductService;
import com.quickmeal.backend.service.UserService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 *
 * @author <a href="https://www.facebook.com/khanhdepzai.pro/">KhanhDzai</a>
 */
@Component
@RequiredArgsConstructor
public class ApplicationInitConfig implements ApplicationRunner {

    private final UserService userService;
    private final UserRepository userRepo;

    private final CategoryService categoryService;
    private final ProductService productService;
    private final ProductRepository productRepo;

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("▶ ApplicationRunner start: " + args.getOptionNames());

        try {
            createUserDefault();
            createCategoryDefault();
            createProductDefault();
            createOrderSeed();
        } catch (Exception e) {
            Logger.fatal(e);
        }
    }

    // ------------------------------------
    // TẠO USER MẶC ĐỊNH
    // ------------------------------------
    private void createUserDefault() {
        if (userRepo.count() != 0) {
            return;
        }

        if (userRepo.existsByUserName("admin") == false) {
            userService.registerUser("admin", "Nguyễn Admin", "admin@zalo.com", "0987363262", "123123", ConstAccount.Role.ADMIN);
        }
        if (userRepo.existsByUserName("staff") == false) {
            userService.registerUser("staff", "Trần Nhân Viên", "staff@zalo.com", "0987363263", "123123", ConstAccount.Role.STAFF);
        }
        if (userRepo.existsByUserName("customer") == false) {
            userService.registerUser("customer", "Vũ Người Dùng", "customer@zalo.com", "0987363264", "123123", ConstAccount.Role.CUSTOMER);
        }
        if (true) {
            return;
        }

        // ===== USER RANDOM =====
        int fakeUserCount = 200; // 👉 đổi 50 / 200 / 1000 tùy test

        for (int i = 1; i <= fakeUserCount; i++) {

            String username = "user" + i;
            String fullName = randomFullName();
            String email = "user" + i + "@example.com";
            String phone = randomPhone(i);

            ConstAccount.Role role = randomRole();

            userService.registerUser(
                    username,
                    fullName,
                    email,
                    phone,
                    "123123", // mật khẩu test cố định
                    role
            );
        }
    }

    // Random họ tên tiếng Việt (đủ dùng cho demo)
    private String randomFullName() {
        String[] lastNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ"};
        String[] middleNames = {"Văn", "Thị", "Hữu", "Minh", "Đức"};
        String[] firstNames = {"An", "Bình", "Cường", "Dũng", "Hà", "Hùng", "Khanh", "Long"};

        ThreadLocalRandom r = ThreadLocalRandom.current();

        return lastNames[r.nextInt(lastNames.length)]
                + " "
                + middleNames[r.nextInt(middleNames.length)]
                + " "
                + firstNames[r.nextInt(firstNames.length)];
    }

    // Random số điện thoại, đảm bảo không trùng
    private String randomPhone(int index) {
        return "0989" + String.format("%06d", index);
    }

    // Random role, KHÔNG tạo admin bừa
    private ConstAccount.Role randomRole() {
        int r = ThreadLocalRandom.current().nextInt(100);

        if (r < 10) {
            return ConstAccount.Role.STAFF;     // 10%
        }
        return ConstAccount.Role.CUSTOMER;     // 90%
    }

    // ------------------------------------
// SEED ORDER CHO USER "Vũ Người Dùng"
// ------------------------------------
    private void createOrderSeed() {

        // Nếu đã có order rồi thì thôi, tránh seed trùng
        if (orderRepository.count() > 0) {
            return;
        }

        // Lấy user "customer"
        UserEntity customer = userRepo.findByUserName("customer")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user customer"));

        // Lấy toàn bộ product
        List<ProductEntity> products = productRepo.findAll();
        if (products.isEmpty()) {
            return;
        }

        int totalOrders = 100;
        ThreadLocalRandom random = ThreadLocalRandom.current();

        for (int i = 0; i < totalOrders; i++) {

            OrderRequestDTO dto = new OrderRequestDTO();
            dto.setUserName(customer.getUserName());
            dto.setAddress("Số " + random.nextInt(1, 300) + " Nguyễn Trãi, Hà Nội");
            dto.setPhone(customer.getPhone());
            dto.setNote("Đơn hàng seed #" + (i + 1));

            // Random 1–5 sản phẩm
            int itemCount = random.nextInt(1, 6);
            List<OrderRequestDTO.OrderItemRequest> items = new ArrayList<>();

            for (int j = 0; j < itemCount; j++) {
                ProductEntity p = products.get(random.nextInt(products.size()));

                OrderRequestDTO.OrderItemRequest item = new OrderRequestDTO.OrderItemRequest();
                item.setProductId(p.getId());
                item.setQuantity(random.nextInt(1, 4)); // 1–3
                items.add(item);
            }

            dto.setItems(items);

            // Tạo order qua service (đúng chuẩn kiến trúc)
            OrderResponseDTO response = orderService.createOrder(dto);

            // Lấy lại entity để set createdAt random
            OrderEntity orderEntity = orderRepository.findById(response.getId())
                    .orElseThrow();

            orderEntity.setStatus(randomOrderStatus());
            orderEntity.setCreatedAt(randomDateTime());
            orderEntity.setUpdatedAt(orderEntity.getCreatedAt());

            orderRepository.save(orderEntity);
        }

        System.out.println("▶ Seed 100 đơn hàng cho user 'Vũ Người Dùng' thành công!");
    }

    private OrderStatus randomOrderStatus() {
        int r = ThreadLocalRandom.current().nextInt(100);

        if (r < 55) {
            return OrderStatus.COMPLETED;
        }
        if (r < 70) {
            return OrderStatus.SHIPPING;
        }
        if (r < 80) {
            return OrderStatus.READY;
        }
        if (r < 88) {
            return OrderStatus.PREPARING;
        }
        if (r < 93) {
            return OrderStatus.PENDING_ACCEPTANCE;
        }
        if (r < 98) {
            return OrderStatus.CANCELLED;
        }
        return OrderStatus.REJECTED;
    }

    private LocalDateTime randomDateTime() {
        LocalDateTime start = LocalDateTime.of(2020, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.now();

        long startEpoch = start.toEpochSecond(java.time.ZoneOffset.UTC);
        long endEpoch = end.toEpochSecond(java.time.ZoneOffset.UTC);

        long randomEpoch = ThreadLocalRandom.current().nextLong(startEpoch, endEpoch);

        return LocalDateTime.ofEpochSecond(randomEpoch, 0, java.time.ZoneOffset.UTC);
    }

    // ------------------------------------
    // TẠO CATEGORY MẶC ĐỊNH
    // ------------------------------------
    private CategoryEntity cateBanhMi;
    private CategoryEntity cateNuoc;
    private CategoryEntity cateCombo;

    private void createCategoryDefault() {
        cateBanhMi = categoryService.createIfNotExist("Bánh mì");
        cateNuoc = categoryService.createIfNotExist("Nước uống");
        cateCombo = categoryService.createIfNotExist("Combo");
    }

    // ------------------------------------
    // TẠO PRODUCT MẶC ĐỊNH
    // ------------------------------------
    private void createProductDefault() {
        if (productRepo.count() != 0) {
            return;
        }

        // --- BÁNH MÌ ---
        productService.create(
                "Bánh mì thịt nguội",
                "Bánh mì thịt nguội truyền thống, kèm pate.",
                25000,
                "/uploads/demo/thit.png",
            cateBanhMi,
            50
        );

        productService.create(
                "Bánh mì chả lụa",
                "Chả lụa ngon, kèm pate và đồ chua.",
                22000,
                "/uploads/demo/chalua.png",
            cateBanhMi,
            50
        );

        productService.create(
                "Bánh Mì Pate",
                "Bánh mì pate đặc biệt với thịt nguội và rau sống tươi ngon",
                25_000,
                "/uploads/demo/banh-mi-pate.png",
            cateBanhMi,
            50
        );
        productService.create(
                "Bánh Mì Thịt Nướng",
                "Thịt nướng thơm lừng, ướp gia vị đậm đà",
                30_000,
                "/uploads/demo/banh-mi-thit-nuong.png",
            cateBanhMi,
            50
        );
        productService.create(
                "Bánh Mì Gà Nướng",
                "Gà nướng sả ớt thơm ngon, kích thích vị giác",
                28_000,
                "/uploads/demo/banh-mi-ga-nuong.png",
            cateBanhMi,
            50
        );
        productService.create(
                "Bánh Mì Xíu Mại",
                "Xíu mại sốt cà chua đặc biệt, vị ngọt thanh",
                27_000,
                "/uploads/demo/banh-mi-xiu-mai.png",
            cateBanhMi,
            50
        );

        productService.create(
                "Bánh Mì Trứng",
                "Trứng ốp la giòn rụm, bổ dưỡng cho bữa sáng",
                20_000,
                "/uploads/demo/banh-mi-trung.png",
            cateBanhMi,
            50
        );
        productService.create(
                "Bánh Mì Chả Cá",
                "Chả cá Hà Nội chính gốc với hành, thì là thơm nức",
                32_000,
                "/uploads/demo/banh-mi-cha-ca.png",
            cateBanhMi,
            50
        );

        // --- NƯỚC ---
        productService.create(
                "Trà Tắc Thanh Mát",
                "Trà Tắc là thức uống thanh mát, chua chua ngọt ngọt giúp gia đình bạn giải nhiệt trong thời tiết nắng nóng hay những khi cơn buồn ngủ ập đến. Được làm bằng nguyên liệu chính là trà, tắc và đường, trà tắc không những là một thức uống giải khát, tốt cho sức khỏe mà còn chứa nhiều chất chống oxy hóa và dưỡng chất có lợi về giảm cân và làm đẹp da. Mua hàng qua mạng uy tín, tiện lợi. Đã đến mùa hè và bạn đang tìm kiếm loại trà hoàn hảo để giải nho mình.",
                13_000,
                "/uploads/demo/tra-tac.png",
                cateNuoc,
                50
        );

        productService.create(
                "Sữa đậu nành nguyên chất Ít đường Fami bịch 200 ml",
                "Là dòng sản phẩm sữa đậu nành với thành phần 100% đậu nành không biến đổi gen, sữa đậu nành Fami mang đến hương vị thơm ngon tuyệt vời và cung cấp những dưỡng chất thiết yếu",
                6_000,
                "/uploads/demo/sua-dau-nanh.png",
                cateNuoc,
                50
        );
        productService.create(
                "Nước tinh khiết Aquafina 500ml",
                "Được lấy từ nguồn nước ngầm đảm bảo  trải qua quy trình khử trùng, lọc sạch các tạp chất. Nước tinh khiết Aquafina 500ml đã đạt tới trình độ nước tinh khiết có tác dụng dịu cơn khát, khi uống sẽ có cảm giác hơi ngọt ở miệng, rất dễ uống. Nhỏ gọn tiện lợi dễ mang bên mình",
                10_000,
                "/uploads/demo/aquafina.png",
                cateNuoc,
                50
        );
        productService.create(
                "Trà chanh dây và hạt chia Fuze Tea 450ml",
                "Trà chanh dây và hạt chia Fuzetea+ chai 450ml được nuôi ủ từ những lá trà xanh cao nguyên tinh túy thanh khiết nhất, lớn lên cùng hương vị tươi ngon. Trà Fuze Tea thơm lừng của những trái chanh dây căng mọng và hạt chia thơm bùi giúp tăng cường năng lượng, vitamin từ nước trà.",
                15_000,
                "/uploads/demo/tra-chanh-day-fuze-tea.png",
                cateNuoc,
                50
        );
        productService.create(
                "Nước ngọt Pepsi 320ml",
                "Sản phẩm từ thương hiệu nước ngọt Pepsi nổi tiếng toàn cầu với mùi vị thơm ngon với hỗn hợp hương tự nhiên cùng chất tạo ngọt tổng hợp, giúp xua tan cơn khát và cảm giác mệt mỏi. Nước ngọt Pepsi Cola lon 320ml bổ sung năng lượng làm việc mỗi ngày. Cam kết nước ngọt chính hãng, chất lượng và an toàn",
                15_000,
                "/uploads/demo/pepsi.png",
                cateNuoc,
                50
        );
        productService.create(
                "Trà đào và hạt chia Fuze Tea 450ml",
                "Trà đào và hạt chia Fuze Tea 450ml là sự kết hợp giữa những lá trà xanh tươi nhất cùng hạt chia thơm bùi đầy dinh dưỡng, quyện cùng vị đào thơm ngọt quyến rũ, nước trà giúp tăng cường năng lượng, vitamin cùng các dưỡng chất cần thiết khác. Trà Fuze Tea không chứa chất béo an toàn giữ dáng.",
                15_000,
                "/uploads/demo/tra-dao-fuze-tea.png",
                cateNuoc,
                50
        );
        productService.create(
                "Trà chanh với sả Fuze Tea 450ml",
                "Sự phối trộn độc đáo giữa vị trà xanh tươi mát, quả chanh chua ngọt sảng khoái và hương sả thơm thư giãn, cho bạn một thức uống giải khát thơm ngon, lạ miệng mà vô cùng tốt cho sức khỏe vị ít ngọt,  cùng chất chống oxy hóa TPP-C dồi dào, cùng lượng vitamin C cao.",
                15_000,
                "/uploads/demo/tra-chanh-sa-fuze-tea.png",
                cateNuoc,
                50
        );

        System.out.println("▶ Seed sản phẩm & category thành công!");
    }

}
