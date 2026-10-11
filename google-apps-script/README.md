# Kết nối Google Sheet để lưu email khảo sát

Mỗi khi người dùng nhập email ở cuối bài khảo sát, server Next.js (`/api/subscribe`) sẽ gửi một dòng dữ liệu tới Google Apps Script, và script ghi dòng đó vào sheet **Responses**.

Các cột: Thời gian · Email · Nguyên mẫu chính · Nguyên mẫu phụ · Điểm · Câu 1 … Câu 15

## Các bước (làm một lần, khoảng 5 phút)

1. **Tạo Google Sheet mới** (ví dụ đặt tên "La Methode – Khảo sát").
2. Trong Sheet, mở **Extensions → Apps Script**.
3. Xoá nội dung mặc định, dán toàn bộ file [`Code.gs`](./Code.gs) vào, bấm **Save**.
4. Đặt mật khẩu bí mật: bấm **Project Settings** (biểu tượng bánh răng) → **Script properties** → **Add script property**
   - Property: `SECRET`
   - Value: một chuỗi ngẫu nhiên dài (ví dụ tạo bằng `npx --yes uuid`)
5. Cấp quyền trước: trên thanh công cụ của trình soạn thảo, chọn hàm **`authorize`** → bấm **Run ▶** → cho phép quyền truy cập. Nhật ký (Execution log) phải in ra tên Sheet và `SECRET đã đặt: có`.
   - Gặp lỗi `401: invalid_client`: mở Sheet trong **cửa sổ ẩn danh** (hoặc profile trình duyệt) chỉ đăng nhập **đúng một** tài khoản Google sở hữu Sheet, rồi thử lại.
6. Bấm **Deploy → New deployment** → chọn loại **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Bấm **Deploy**, cấp quyền khi Google hỏi, rồi sao chép **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).
7. Trong thư mục dự án, tạo file `.env.local` (dựa theo `.env.example`):

   ```
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
   GOOGLE_SHEETS_SECRET=chuỗi-bí-mật-ở-bước-4
   ```

8. Khởi động lại `npm run dev`. Làm thử bài khảo sát → nhập email → kiểm tra dòng mới trong sheet **Responses** (sheet và hàng tiêu đề được tạo tự động).

## Lưu ý

- `SECRET` chỉ nằm ở server (`.env.local`) và trong Script properties, không bao giờ gửi xuống trình duyệt, nên người ngoài không ghi bừa vào Sheet được dù biết URL.
- Khi sửa `Code.gs`, phải **Deploy → Manage deployments → Edit → New version** thì thay đổi mới có hiệu lực (URL giữ nguyên).
- Khi deploy lên hosting (Vercel…), thêm 2 biến môi trường trên vào phần cấu hình của hosting.
- Chưa cấu hình mà chạy ở chế độ dev: bài khảo sát vẫn chạy bình thường, dữ liệu chỉ được in ra terminal thay vì lưu vào Sheet.
