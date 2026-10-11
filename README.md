# La Methode

Website La Methode: trang giới thiệu, bài khảo sát **Aura Introspection** (15 câu hỏi) và **báo cáo nguyên mẫu** riêng cho 12 nguyên mẫu tính cách. Mỗi báo cáo có giao diện, màu sắc và hiệu ứng cuộn riêng.

Làm bằng Next.js 16, React 19, Tailwind CSS 4, GSAP, Lenis và React Three Fiber.

---

## 1. Cần cài trước

| Phần mềm | Phiên bản | Kiểm tra bằng lệnh |
| --- | --- | --- |
| [Node.js](https://nodejs.org) | 20.9 trở lên (khuyên dùng 22 LTS) | `node -v` |
| npm | đi kèm Node.js | `npm -v` |
| [Git](https://git-scm.com) | bản mới bất kỳ | `git --version` |

---

## 2. Các bước chạy dự án (lần đầu)

**Bước 1 — Tải code về**

```bash
git clone https://github.com/La-Mehode/La-methode.git
cd La-methode
```

**Bước 2 — Cài thư viện**

```bash
npm install
```

**Bước 3 — Tạo file cấu hình `.env.local`**

Sao chép file mẫu:

```bash
# macOS / Linux / Git Bash
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Mở `.env.local` và điền 2 giá trị để lưu email khảo sát vào Google Sheet. Cách lấy 2 giá trị này xem ở [google-apps-script/README.md](google-apps-script/README.md).

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
GOOGLE_SHEETS_SECRET=chuỗi-bí-mật
```

> Chưa có 2 giá trị này vẫn chạy được ở chế độ dev. Khi đó email chỉ được in ra terminal, không lưu vào Sheet.
> **Không bao giờ** đưa `.env.local` lên Git: file này đã nằm trong `.gitignore`.

**Bước 4 — Chạy chế độ phát triển**

```bash
npm run dev
```

Mở trình duyệt vào **http://localhost:3000**. Sửa code thì trang tự cập nhật.

---

## 3. Các trang chính

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ |
| `/quiz` | Bài khảo sát 15 câu → kết quả → nhập email → mở báo cáo |
| `/report?p=NTI&s=NNT` | Báo cáo nguyên mẫu (`p` = nguyên mẫu chính, `s` = nguyên mẫu phụ) |
| `/showcase`, `/about`, `/contact` | Các trang phụ |

Mã nguyên mẫu dùng cho `p` và `s`:

| Mã | Nguyên mẫu | | Mã | Nguyên mẫu |
| --- | --- | --- | --- | --- |
| `NNT` | Innocent — Thiếu Nữ Ngây Thơ | | `NTI` | Lover — Người Tình |
| `HGI` | Sage — Nhà Hiền Triết | | `NLD` | Ruler — Nhà Cai Trị / Nữ Hoàng |
| `PTS` | Magician — Pháp Sư / Nhà Giả Kim | | `THE` | Jester — Chú Hề / Người Vui Vẻ |
| `AH` | Hero — Chiến Binh | | `KNL` | Rebel — Kẻ Nổi Loạn |
| `NST` | Creator — Nhà Sáng Tạo | | `NBD` | Everyman — Người Bình Thường / Công Dân |
| `NCS` | Caregiver — Người Chăm Sóc | | `NTH` | Explorer — Nhà Thám Hiểm |

---

## 4. Chạy bản chính thức (production)

```bash
npm run build      # đóng gói, kiểm tra lỗi TypeScript
npm start          # chạy ở http://localhost:3000
npm start -- -p 3100   # hoặc chọn cổng khác, ví dụ 3100
```

Sửa code xong phải chạy lại `npm run build` rồi `npm start` thì bản production mới có thay đổi.

### Chia sẻ link tạm cho người khác xem (không cần deploy)

Máy bạn phải bật và `npm start` phải đang chạy.

```bash
npm install -g localtunnel
lt --port 3100 --subdomain la-methode-demo
```

- Gửi link `https://la-methode-demo.loca.lt` cho người xem.
- Lần đầu mở, trang sẽ hỏi **Tunnel Password**. Mật khẩu là IP công cộng của máy bạn: mở https://loca.lt/mytunnelpassword trên máy bạn để xem.
- Localtunnel miễn phí nên đôi lúc rớt kết nối. Muốn có link cố định thì deploy lên Vercel (mục 7).

---

## 5. Các lệnh khác

| Lệnh | Công dụng |
| --- | --- |
| `npm run lint` | Kiểm tra lỗi code (ESLint) |
| `npm run reports:build` | Tạo lại nội dung báo cáo từ file Word/Markdown (mục 6) |
| `npm run images:status` | Xem nguyên mẫu nào còn thiếu ảnh |
| `npm run images:optimize` | Nén ảnh mới thêm sang WebP cho nhẹ |

---

## 6. Cập nhật nội dung & hình ảnh

### Nội dung báo cáo

1. Đặt file vào `content-source/reports/`, tên file kết thúc bằng `The_<Tên>.docx` hoặc `.md`, ví dụ `La_Methode_The_Lover.docx`. File `.md` là bản Google Docs tải về dạng Markdown.
2. Chạy:

   ```bash
   npm run reports:build
   ```

3. Script tạo lại `src/content/reports/<nguyên-mẫu>.json` và tự kiểm tra xem có bị thiếu nội dung không.

### Hình ảnh báo cáo

1. Prompt tạo ảnh cho từng nguyên mẫu nằm trong `docs/image-prompts/`.
2. Bỏ ảnh vào `public/images/report/<nguyên-mẫu>/`, đặt đúng tên: `hero`, `portrait`, `core`, `love`, `symbol` (đuôi `.png`, `.jpg`…). Ví dụ `public/images/report/lover/hero.png`.
3. Chạy:

   ```bash
   npm run images:optimize   # đổi sang .webp, ảnh gốc được chuyển vào content-source/images-original/
   npm run images:status     # kiểm tra còn thiếu ảnh nào
   ```

Ảnh gốc trong `content-source/images-original/` rất nặng nên không đưa lên Git.

---

## 7. Deploy lên Vercel (link cố định)

1. Vào [vercel.com/new](https://vercel.com/new) và chọn repo này.
2. Tại **Environment Variables**, thêm `GOOGLE_SHEETS_WEBHOOK_URL` và `GOOGLE_SHEETS_SECRET` (giống trong `.env.local`).
3. Bấm **Deploy**. Từ đó mỗi lần push lên nhánh `main`, Vercel sẽ tự deploy lại.

---

## 8. Cấu trúc thư mục

```
src/
  app/
    (site)/            Trang chủ, showcase, about, contact
    (quiz)/quiz/       Bài khảo sát
    (quiz)/report/     Trang báo cáo nguyên mẫu
    api/subscribe/     API nhận email → ghi vào Google Sheet
  components/
    quiz/              Giao diện khảo sát
    report/            Giao diện báo cáo (cảnh cuộn, thẻ, quả cầu 3D, thẻ story…)
  content/reports/     Nội dung báo cáo dạng JSON (tạo bằng reports:build)
  lib/
    quiz/              Câu hỏi và cách tính điểm
    report/            Đọc nội dung + theme màu của 12 nguyên mẫu
content-source/        File gốc: bộ câu hỏi, nội dung Word/Markdown
docs/image-prompts/    Prompt tạo ảnh cho từng nguyên mẫu
google-apps-script/    Code Apps Script + hướng dẫn kết nối Google Sheet
public/images/report/  Ảnh của báo cáo (WebP)
scripts/               Script xử lý nội dung và ảnh
```

---

## 9. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| `npm install` báo lỗi phiên bản | Cập nhật Node.js lên 20.9 trở lên |
| Cổng 3000 đang bị dùng | `npm run dev -- -p 3001` |
| Gửi email báo "Chưa gửi được" | Kiểm tra 2 biến trong `.env.local`, rồi khởi động lại server. Xem thêm [google-apps-script/README.md](google-apps-script/README.md) |
| Sửa CSS mà trang không đổi | Tắt `npm run dev` (Ctrl + C) rồi chạy lại |
| Bản production không thấy thay đổi | Chạy lại `npm run build` rồi `npm start` |
