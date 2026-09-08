\CHƯƠNG 4. TRẢI NGHIỆM KHÁCH HÀNG (UX) VÀ CÁC TÍNH NĂNG ĐỘT PHÁ
4.1. Hoàn thiện luồng nghiệp vụ phía trình duyệt (Customer Flow)

Một trong những mục tiêu quan trọng của hệ thống QuickMeal là mang lại trải nghiệm đặt món nhanh chóng, trực quan và liền mạch cho người dùng cuối. Do đó, nhóm tập trung thiết kế và tối ưu toàn bộ luồng nghiệp vụ phía trình duyệt (Browser-side Customer Flow), bắt đầu từ bước truy cập hệ thống cho đến khi hoàn tất thanh toán.

Người dùng có thể truy cập hệ thống dưới vai trò Guest để xem danh sách sản phẩm, danh mục và thông tin chi tiết món ăn. Khi có nhu cầu đặt món, hệ thống cho phép người dùng đăng nhập hoặc tiếp tục với tài khoản đã xác thực để đảm bảo tính nhất quán dữ liệu đơn hàng.

Chức năng Giỏ hàng (Cart) được xây dựng theo cơ chế state-driven phía Frontend, cho phép:

Thêm / xóa sản phẩm theo thời gian thực

Cập nhật số lượng món ăn tức thì

Tính toán tổng tiền động dựa trên dữ liệu sản phẩm

Luồng Checkout được thiết kế đơn giản, hạn chế tối đa số bước trung gian, giúp giảm tỷ lệ rời bỏ (drop-off rate). Các thông tin đơn hàng được kiểm tra hợp lệ trước khi gửi về Backend nhằm đảm bảo tính toàn vẹn dữ liệu và tránh lỗi phát sinh trong quá trình xử lý.

4.2. Chiến lược Responsive Design – Mobile First Approach

Nhận thức được xu hướng người dùng chủ yếu đặt món thông qua thiết bị di động, hệ thống QuickMeal được thiết kế theo chiến lược Mobile-First. Giao diện được xây dựng để tối ưu hiển thị trên màn hình nhỏ trước, sau đó mở rộng dần cho tablet và desktop.

Framework Tailwind CSS được sử dụng để triển khai responsive layout một cách linh hoạt thông qua các breakpoint chuẩn. Điều này giúp:

Giao diện hiển thị nhất quán trên nhiều độ phân giải

Giảm chi phí bảo trì CSS

Tăng tốc độ phát triển giao diện

Ngoài ra, hệ thống được kiểm thử trên nhiều rendering engine phổ biến như Blink (Chrome, Edge) và WebKit (Safari) nhằm đảm bảo khả năng tương thích trình duyệt và trải nghiệm người dùng ổn định trên các nền tảng khác nhau.

4.3. Các tính năng đột phá và điểm nhấn kỹ thuật

So với các ứng dụng CRUD truyền thống, QuickMeal được xây dựng với tư duy hệ thống thực chiến, thể hiện qua một số điểm nhấn nổi bật:

Tách biệt rõ ràng giữa trải nghiệm người dùng và xử lý nghiệp vụ, giúp Frontend phản hồi nhanh và Backend tập trung vào xử lý logic phức tạp.

Hệ thống thông báo trạng thái (UX Feedback Loop) thông qua Sonner và Rich Toasts, cung cấp phản hồi tức thì cho người dùng khi thực hiện các hành động như thêm món, thanh toán hay đăng nhập.

Thiết kế hướng mở, cho phép dễ dàng mở rộng thêm các tính năng như khuyến mãi, đánh giá sản phẩm hoặc tích hợp cổng thanh toán trong tương lai.

Những yếu tố trên giúp QuickMeal không chỉ đáp ứng yêu cầu bài tập lớn mà còn tiệm cận với các hệ thống thương mại điện tử thực tế.

CHƯƠNG 5. KIỂM THỬ HIỆU NĂNG VÀ TẦM NHÌN PHÁT TRIỂN
5.1. Kiểm thử thực tế (Performance & Compatibility Testing)

Sau khi hoàn thiện các chức năng chính, hệ thống QuickMeal được tiến hành kiểm thử nhằm đánh giá hiệu năng và độ ổn định trong điều kiện sử dụng thực tế.

Các tiêu chí kiểm thử bao gồm:

Độ trễ phản hồi (Latency) của các API quan trọng như lấy danh sách sản phẩm, tạo đơn hàng và đăng nhập

Khả năng chịu tải khi có nhiều request đồng thời

Tính tương thích trình duyệt trên các nền tảng phổ biến

Kết quả kiểm thử cho thấy hệ thống duy trì thời gian phản hồi ổn định trong điều kiện tải vừa và cao, đặc biệt khi kết hợp Virtual Threads ở Backend giúp tối ưu việc xử lý các request đồng thời mà không gây quá tải tài nguyên.

5.2. Tổng kết và tầm nhìn mở rộng hệ thống

Thông qua quá trình xây dựng và triển khai QuickMeal, nhóm đã áp dụng được nhiều kiến thức quan trọng về thiết kế hệ thống, lập trình Backend – Frontend và tư duy tối ưu hiệu năng.

Trong tương lai, hệ thống có thể được phát triển theo hướng:

Cloud Native Architecture, triển khai trên các nền tảng như Docker và Kubernetes

Mở rộng cơ chế scalability ngang (horizontal scaling) để phục vụ lượng người dùng lớn

Tích hợp các dịch vụ bên thứ ba như thanh toán trực tuyến, hệ thống gợi ý món ăn hoặc phân tích hành vi người dùng

QuickMeal không chỉ là một bài tập lớn mang tính học thuật mà còn là nền tảng để nhóm tiếp tục phát triển thành một sản phẩm hoàn chỉnh, có khả năng ứng dụng thực tế.