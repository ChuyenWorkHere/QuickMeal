# 📚 QuickMeal - Reports

Thư mục này chứa toàn bộ **tài liệu và biểu đồ UML** phục vụ việc phân tích & thiết kế hệ thống **QuickMeal**. Các file được tạo bằng **PlantUML** và một số file Word, giúp mô tả **Use Case, ERD và trình tự hoạt động** của các chức năng trong hệ thống.

---

## 🔹 Nội dung thư mục

| Tên file | Loại | Mô tả |
|----------|------|-------|
| `erd.txt` | Text / PlantUML | Mã PlantUML để vẽ **Entity-Relationship Diagram (ERD)**, mô tả cấu trúc cơ sở dữ liệu. |
| `Use Case Diagram.txt` | Text / PlantUML | Mã PlantUML vẽ **Use Case Diagram tổng quát** cho hệ thống QuickMeal. |
| `trình tự use case đăng nhập.txt` | Text / PlantUML | Mã PlantUML biểu diễn **trình tự các bước đăng nhập**. |
| `trình tự use case đăng ký.txt` | Text / PlantUML | Mã PlantUML biểu diễn **trình tự các bước đăng ký tài khoản**. |
| `trình tự use case quản lý danh mục.txt` | Text / PlantUML | Mã PlantUML biểu diễn **trình tự xử lý quản lý danh mục sản phẩm**. |
| `trình tự use case quản lý món ăn.txt` | Text / PlantUML | Mã PlantUML biểu diễn **trình tự xử lý quản lý món ăn**. |
| `trình tự use case upload hình ảnh.txt` | Text / PlantUML | Mã PlantUML biểu diễn **trình tự xử lý upload hình ảnh món ăn**. |
| `SamQuocKhanh_2021608280.docx` | Word Document | Báo cáo tổng hợp cá nhân, bao gồm phân tích, thiết kế, mô tả Use Case và UML. |
| `README.md` | Markdown | File này: hướng dẫn nội dung và cách sử dụng thư mục reports. |

---

## 🔹 Hướng dẫn sử dụng

1. **Xem trực tiếp bằng PlantUML**
   - Copy toàn bộ nội dung trong file `.txt` vào [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/) để xem biểu đồ trực quan.
   - Hoặc cài [PlantUML Extension cho VSCode](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) để mở trực tiếp trong IDE.
2. **Chỉnh sửa biểu đồ**
   - Mỗi file `.txt` là mã nguồn PlantUML. Bạn có thể thêm, bớt, sửa text để cập nhật biểu đồ.
3. **Xuất ra hình ảnh**
   - Sau khi load PlantUML, có thể export ra PNG/SVG/PDF để đưa vào báo cáo hoặc thuyết trình.

---

## 🔹 Ghi chú

- Tất cả file `.txt` trong thư mục này đều **có thể chạy trực tiếp trên PlantUML Online Server**.
- Mục đích: giữ **source code UML nguyên bản**, dễ version control, không mất định dạng khi chỉnh sửa.
- File Word chứa tổng hợp toàn bộ báo cáo, có thể tham khảo biểu đồ từ các file `.txt` nếu muốn cập nhật.

---

## 🔹 Mẹo chuyên nghiệp

- Giữ file `.txt` như **single source of truth**: mỗi khi muốn update Use Case hoặc ERD, chỉ cần chỉnh file `.txt` → export ra PNG/SVG → update báo cáo.
- Nếu dùng VSCode + PlantUML Extension: có thể **hover xem diagram trực tiếp**, cực tiện khi trình bày đồ án.

---
