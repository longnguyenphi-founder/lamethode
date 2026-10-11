# 08 · The Rebel — Kẻ Nổi Loạn

*Mood:* **Wild Rouge** · *Bảng màu:* deep rouge red, rose pink, burgundy, warm blush

*Nhân vật (dùng chung cho hero, portrait, core):* khoảng 23 tuổi, tóc shag cắt tỉa cá tính, son đỏ đậm, áo khoác da màu đỏ rượu khoác ngoài áo thun trắng, trang sức bạc.

Lưu cả 5 ảnh vào thư mục **`public/images/report/rebel/`**. Xong thì chạy `npm run images:status` để kiểm tra.

**Negative prompt** (nếu công cụ có ô này — dùng chung cho cả 5 ảnh):

```text
text, watermark, logo, signature, extra fingers, deformed hands, distorted face, harsh shadows, black background, dark moody lighting, neon colors, oversaturated, plastic skin, celebrity likeness, cluttered background
```

---

## Ảnh 1/5 · `hero` — Chân dung bìa (đầu trang)

- [ ] **Lưu thành:** `public/images/report/rebel/hero.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1600 × 2000 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Tạo ảnh này **trước tiên**. Ảnh ưng ý rồi thì dùng nó làm **ảnh tham chiếu nhân vật** cho `portrait` và `core` để giữ cùng một gương mặt (Midjourney: thêm `--cref <link ảnh hero>`; công cụ khác: tải ảnh hero lên làm reference).

**Prompt — copy nguyên khối:**

```text
edgy editorial portrait of a bold young woman with a choppy shag haircut and red lips, burgundy leather jacket, rose-pink backdrop with hand-painted brush strokes, fearless direct gaze, the woman is a 23-year-old Vietnamese woman with a choppy shag haircut, bold red lips, burgundy leather jacket over a white tee, silver jewelry, vertical 4:5 portrait format, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of deep rouge red, rose pink, burgundy, warm blush, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 2/5 · `portrait` — Chân dung đời thường (mục “Bạn thực sự là ai”)

- [ ] **Lưu thành:** `public/images/report/rebel/portrait.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
young woman leaning against a wall covered in rose and rouge spray-paint art on a sunny rooftop, silver rings, confident relaxed pose, the woman is a 23-year-old Vietnamese woman with a choppy shag haircut, bold red lips, burgundy leather jacket over a white tee, silver jewelry, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of deep rouge red, rose pink, burgundy, warm blush, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 3/5 · `core` — Khoảnh khắc nội tâm (mục “Lõi tính cách”)

- [ ] **Lưu thành:** `public/images/report/rebel/core.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
close-up of hands with silver rings tearing a page from a notebook among ripped paper collage pieces in rouge and pink tones, the hands belong to a 23-year-old Vietnamese woman with a choppy shag haircut, bold red lips, burgundy leather jacket over a white tee, silver jewelry, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of deep rouge red, rose pink, burgundy, warm blush, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 4/5 · `love` — Tình yêu (mục “Bạn muốn một tình yêu như nào”)

- [ ] **Lưu thành:** `public/images/report/rebel/love.webp`
- **Khung hình:** ngang **4:3** · tối thiểu 1600 × 1200 px · Midjourney thêm `--ar 4:3`
- **Mẹo:** Chỉ thấy rõ mặt cô gái; người kia quay lưng hoặc khuất mặt.

**Prompt — copy nguyên khối:**

```text
couple riding a vintage scooter at sunset through a city street, the woman's hair flying wild, laughing, partner seen from behind, the woman is a young Vietnamese woman in her mid twenties, horizontal 4:3 format, subjects kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of deep rouge red, rose pink, burgundy, warm blush, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 5/5 · `symbol` — Vật thể 3D điểm nhấn (trôi nổi đầu trang & “Lời khuyên”)

- [ ] **Lưu thành:** `public/images/report/rebel/symbol.png`
- **Khung hình:** vuông **1:1** · tối thiểu 1600 × 1600 px · Midjourney thêm `--ar 1:1`
- **Mẹo:** Xuất **PNG nền trong suốt**. Nếu công cụ không tạo được nền trong suốt, tạo trên nền trắng rồi tách nền (remove.bg, Photoshop, Canva…).

**Prompt — copy nguyên khối:**

```text
a rose-gold chrome lightning bolt bursting through a pane of frosted glass with shards turning into small pink butterflies, square 1:1 format, 3D render, single object floating and centered with generous empty margin around it, soft studio lighting with gentle rim light, subtle soft shadow beneath, premium product-visualization style, smooth glossy and frosted materials, color palette of deep rouge red, rose pink, burgundy, warm blush, isolated on a transparent background, no text, no logo, no watermark
```
