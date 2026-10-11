# 04 · The Ruler — Nhà Cai Trị / Nữ Hoàng

*Mood:* **Champagne Crown** · *Bảng màu:* ivory, champagne gold, warm beige, pearl white

*Nhân vật (dùng chung cho hero, portrait, core):* khoảng 27 tuổi, tóc búi thấp gọn gàng, khuyên tai vàng, blazer màu kem đứng form hoặc đầm satin champagne.

Lưu cả 5 ảnh vào thư mục **`public/images/report/ruler/`**. Xong thì chạy `npm run images:status` để kiểm tra.

**Negative prompt** (nếu công cụ có ô này — dùng chung cho cả 5 ảnh):

```text
text, watermark, logo, signature, extra fingers, deformed hands, distorted face, harsh shadows, black background, dark moody lighting, neon colors, oversaturated, plastic skin, celebrity likeness, cluttered background
```

---

## Ảnh 1/5 · `hero` — Chân dung bìa (đầu trang)

- [ ] **Lưu thành:** `public/images/report/ruler/hero.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1600 × 2000 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Tạo ảnh này **trước tiên**. Ảnh ưng ý rồi thì dùng nó làm **ảnh tham chiếu nhân vật** cho `portrait` và `core` để giữ cùng một gương mặt (Midjourney: thêm `--cref <link ảnh hero>`; công cụ khác: tải ảnh hero lên làm reference).

**Prompt — copy nguyên khối:**

```text
powerful symmetrical portrait of a poised young woman seated upright on a cream armchair in an elegant classical room with marble and gold details, sleek low bun, gold earrings, calm commanding gaze, the woman is a 27-year-old Vietnamese woman with a sleek low bun, gold earrings, wearing a structured cream blazer, vertical 4:5 portrait format, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of ivory, champagne gold, warm beige, pearl white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 2/5 · `portrait` — Chân dung đời thường (mục “Bạn thực sự là ai”)

- [ ] **Lưu thành:** `public/images/report/ruler/portrait.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
confident young woman in a tailored cream blazer standing by a tall window in a refined office with marble surfaces, looking out over the city, morning light, the woman is a 27-year-old Vietnamese woman with a sleek low bun, gold earrings, wearing a structured cream blazer, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of ivory, champagne gold, warm beige, pearl white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 3/5 · `core` — Khoảnh khắc nội tâm (mục “Lõi tính cách”)

- [ ] **Lưu thành:** `public/images/report/ruler/core.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
close-up of elegant hands with gold rings placing a queen piece on a marble chessboard, soft champagne light, the hands belong to a 27-year-old Vietnamese woman with a sleek low bun, gold earrings, wearing a structured cream blazer, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of ivory, champagne gold, warm beige, pearl white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 4/5 · `love` — Tình yêu (mục “Bạn muốn một tình yêu như nào”)

- [ ] **Lưu thành:** `public/images/report/ruler/love.webp`
- **Khung hình:** ngang **4:3** · tối thiểu 1600 × 1200 px · Midjourney thêm `--ar 4:3`
- **Mẹo:** Chỉ thấy rõ mặt cô gái; người kia quay lưng hoặc khuất mặt.

**Prompt — copy nguyên khối:**

```text
elegant dinner for two at a candle-lit table with crisp linen and champagne glasses, the woman laughing graciously, partner's face out of frame, refined and warm, the woman is a young Vietnamese woman in her mid twenties, horizontal 4:3 format, subjects kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of ivory, champagne gold, warm beige, pearl white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 5/5 · `symbol` — Vật thể 3D điểm nhấn (trôi nổi đầu trang & “Lời khuyên”)

- [ ] **Lưu thành:** `public/images/report/ruler/symbol.png`
- **Khung hình:** vuông **1:1** · tối thiểu 1600 × 1600 px · Midjourney thêm `--ar 1:1`
- **Mẹo:** Xuất **PNG nền trong suốt**. Nếu công cụ không tạo được nền trong suốt, tạo trên nền trắng rồi tách nền (remove.bg, Photoshop, Canva…).

**Prompt — copy nguyên khối:**

```text
a minimalist crown in brushed champagne gold set with soft pearls, sculptural and modern, square 1:1 format, 3D render, single object floating and centered with generous empty margin around it, soft studio lighting with gentle rim light, subtle soft shadow beneath, premium product-visualization style, smooth glossy and frosted materials, color palette of ivory, champagne gold, warm beige, pearl white, isolated on a transparent background, no text, no logo, no watermark
```
