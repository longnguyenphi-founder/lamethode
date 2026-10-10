# 10 · The Everyman — Người Bình Thường / Công Dân

*Mood:* **Linen Home** · *Bảng màu:* natural linen, dusty blue, oatmeal, soft white

*Nhân vật (dùng chung cho hero, portrait, core):* khoảng 25 tuổi, gương mặt thân thiện, tóc ngang vai, áo sơ mi denim nhạt kết hợp linen.

Lưu cả 5 ảnh vào thư mục **`public/images/report/everyman/`**. Xong thì chạy `npm run images:status` để kiểm tra.

**Negative prompt** (nếu công cụ có ô này — dùng chung cho cả 5 ảnh):

```text
text, watermark, logo, signature, extra fingers, deformed hands, distorted face, harsh shadows, black background, dark moody lighting, neon colors, oversaturated, plastic skin, celebrity likeness, cluttered background
```

---

## Ảnh 1/5 · `hero` — Chân dung bìa (đầu trang)

- [ ] **Lưu thành:** `public/images/report/everyman/hero.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1600 × 2000 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Tạo ảnh này **trước tiên**. Ảnh ưng ý rồi thì dùng nó làm **ảnh tham chiếu nhân vật** cho `portrait` và `core` để giữ cùng một gương mặt (Midjourney: thêm `--cref <link ảnh hero>`; công cụ khác: tải ảnh hero lên làm reference).

**Prompt — copy nguyên khối:**

```text
warm candid portrait of a friendly young woman at a cozy neighborhood cafe holding a ceramic coffee cup, genuine smile, linen and dusty-blue tones, the woman is a 25-year-old Vietnamese woman with a friendly face and shoulder-length hair, wearing a light denim shirt and linen trousers, vertical 4:5 portrait format, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of natural linen, dusty blue, oatmeal, soft white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 2/5 · `portrait` — Chân dung đời thường (mục “Bạn thực sự là ai”)

- [ ] **Lưu thành:** `public/images/report/everyman/portrait.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
young woman sharing a homemade meal with friends around a long wooden table at home, friends softly out of focus, warm belonging, the woman is a 25-year-old Vietnamese woman with a friendly face and shoulder-length hair, wearing a light denim shirt and linen trousers, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of natural linen, dusty blue, oatmeal, soft white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 3/5 · `core` — Khoảnh khắc nội tâm (mục “Lõi tính cách”)

- [ ] **Lưu thành:** `public/images/report/everyman/core.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
cozy home corner, a woman's hands holding a ceramic mug, knitted blanket, potted plants, soft morning light, the woman is a 25-year-old Vietnamese woman with a friendly face and shoulder-length hair, wearing a light denim shirt and linen trousers, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of natural linen, dusty blue, oatmeal, soft white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 4/5 · `love` — Tình yêu (mục “Bạn muốn một tình yêu như nào”)

- [ ] **Lưu thành:** `public/images/report/everyman/love.webp`
- **Khung hình:** ngang **4:3** · tối thiểu 1600 × 1200 px · Midjourney thêm `--ar 4:3`
- **Mẹo:** Chỉ thấy rõ mặt cô gái; người kia quay lưng hoặc khuất mặt.

**Prompt — copy nguyên khối:**

```text
couple cooking a simple dinner together in a cozy kitchen, the woman laughing while stirring a pot, partner partly out of frame, the woman is a young Vietnamese woman in her mid twenties, horizontal 4:3 format, subjects kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of natural linen, dusty blue, oatmeal, soft white, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 5/5 · `symbol` — Vật thể 3D điểm nhấn (trôi nổi đầu trang & “Lời khuyên”)

- [ ] **Lưu thành:** `public/images/report/everyman/symbol.png`
- **Khung hình:** vuông **1:1** · tối thiểu 1600 × 1600 px · Midjourney thêm `--ar 1:1`
- **Mẹo:** Xuất **PNG nền trong suốt**. Nếu công cụ không tạo được nền trong suốt, tạo trên nền trắng rồi tách nền (remove.bg, Photoshop, Canva…).

**Prompt — copy nguyên khối:**

```text
a handmade ceramic mug with dusty-blue glaze and a soft linen-colored interlocking knot beside it, square 1:1 format, 3D render, single object floating and centered with generous empty margin around it, soft studio lighting with gentle rim light, subtle soft shadow beneath, premium product-visualization style, smooth glossy and frosted materials, color palette of natural linen, dusty blue, oatmeal, soft white, isolated on a transparent background, no text, no logo, no watermark
```
