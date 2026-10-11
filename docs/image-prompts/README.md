# Prompt tạo ảnh — Trang báo cáo nguyên mẫu La Methode

**60 ảnh** = 12 nguyên mẫu × 5 ảnh. Mỗi nguyên mẫu một file; trong file, **mỗi ảnh một khối prompt đã ghép sẵn** — chỉ việc copy dán vào công cụ tạo ảnh (Midjourney, ChatGPT, Gemini, Ideogram…).

## Cách làm

1. Mở file của nguyên mẫu (bảng bên dưới).
2. Tạo ảnh **`hero` trước**, rồi dùng nó làm ảnh tham chiếu nhân vật cho `portrait` và `core` → cả 3 ảnh là cùng một cô gái.
3. Lưu ảnh đúng **tên file** và **thư mục** ghi trong từng khối (`.webp`, `.jpg`, `.png` đều được; riêng `symbol` cần nền trong suốt nên dùng `.png`).
4. Kiểm tra ảnh nào đã có / còn thiếu:

   ```
   npm run images:status
   ```

5. Mở `http://localhost:3000/report?p=<mã>` để xem ảnh chạy hiệu ứng trên trang.

Ảnh chưa có thì trang dùng vật thể 3D thay chỗ, nên có thể làm dần từng nguyên mẫu.

## Danh sách

| # | Nguyên mẫu | File prompt | Thư mục lưu ảnh | Xem trang |
|---|---|---|---|---|
| 01 | The Innocent — Thiếu Nữ Ngây Thơ | [01-innocent.md](./01-innocent.md) | `public/images/report/innocent/` | `/report?p=NNT` |
| 02 | The Sage — Nhà Hiền Triết | [02-sage.md](./02-sage.md) | `public/images/report/sage/` | `/report?p=HGI` |
| 03 | The Lover — Người Tình | [03-lover.md](./03-lover.md) | `public/images/report/lover/` | `/report?p=NTI` |
| 04 | The Ruler — Nhà Cai Trị / Nữ Hoàng | [04-ruler.md](./04-ruler.md) | `public/images/report/ruler/` | `/report?p=NLD` |
| 05 | The Magician — Pháp Sư / Nhà Giả Kim | [05-magician.md](./05-magician.md) | `public/images/report/magician/` | `/report?p=PTS` |
| 06 | The Jester — Chú Hề / Người Vui Vẻ | [06-jester.md](./06-jester.md) | `public/images/report/jester/` | `/report?p=THE` |
| 07 | The Hero — Chiến Binh | [07-hero.md](./07-hero.md) | `public/images/report/hero/` | `/report?p=AH` |
| 08 | The Rebel — Kẻ Nổi Loạn | [08-rebel.md](./08-rebel.md) | `public/images/report/rebel/` | `/report?p=KNL` |
| 09 | The Creator — Nhà Sáng Tạo | [09-creator.md](./09-creator.md) | `public/images/report/creator/` | `/report?p=NST` |
| 10 | The Everyman — Người Bình Thường / Công Dân | [10-everyman.md](./10-everyman.md) | `public/images/report/everyman/` | `/report?p=NBD` |
| 11 | The Caregiver — Người Chăm Sóc | [11-caregiver.md](./11-caregiver.md) | `public/images/report/caregiver/` | `/report?p=NCS` |
| 12 | The Explorer — Nhà Thám Hiểm | [12-explorer.md](./12-explorer.md) | `public/images/report/explorer/` | `/report?p=NTH` |

## Lưu ý khi tạo ảnh

- **Không tạo ảnh giống người nổi tiếng** — prompt không chứa tên người thật.
- **Chừa lề:** ảnh `portrait`, `core`, `love` sẽ zoom nhẹ và hé mở như màn trập khi cuộn — không để mặt hay tay sát mép.
- **Lover** và **Explorer**: ảnh `hero` là **ngang 16:9**, cô gái ở 1/3 bên phải (làm nền tràn màn hình).
- Không chữ, không logo, không watermark; tay và mặt không biến dạng; tổng thể sáng, không nền đen.
- Mỗi file nên dưới ~500KB (xuất `.webp` chất lượng 80–85).
