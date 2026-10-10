# 02 · The Sage — Nhà Hiền Triết

*Mood:* **Quiet Library** · *Bảng màu:* parchment ivory, sage green, soft olive, warm oak brown

*Nhân vật (dùng chung cho hero, portrait, core):* khoảng 26 tuổi, tóc bob ngang cằm hoặc búi thấp, kính gọng vàng mảnh, áo len màu yến mạch và quần linen xanh xô thơm.

Lưu cả 5 ảnh vào thư mục **`public/images/report/sage/`**. Xong thì chạy `npm run images:status` để kiểm tra.

**Negative prompt** (nếu công cụ có ô này — dùng chung cho cả 5 ảnh):

```text
text, watermark, logo, signature, extra fingers, deformed hands, distorted face, harsh shadows, black background, dark moody lighting, neon colors, oversaturated, plastic skin, celebrity likeness, cluttered background
```

---

## Ảnh 1/5 · `hero` — Chân dung bìa (đầu trang)

- [ ] **Lưu thành:** `public/images/report/sage/hero.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1600 × 2000 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Tạo ảnh này **trước tiên**. Ảnh ưng ý rồi thì dùng nó làm **ảnh tham chiếu nhân vật** cho `portrait` và `core` để giữ cùng một gương mặt (Midjourney: thêm `--cref <link ảnh hero>`; công cụ khác: tải ảnh hero lên làm reference).

**Prompt — copy nguyên khối:**

```text
portrait of a calm, intelligent young woman in a sunlit old library, holding an antique book against her chest, thin gold-rimmed glasses, composed direct gaze, tall shelves softly blurred behind her, the woman is a 26-year-old Vietnamese woman with a chin-length bob, thin gold-rimmed glasses, oatmeal knit sweater and sage green linen trousers, vertical 4:5 portrait format, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of parchment ivory, sage green, soft olive, warm oak brown, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 2/5 · `portrait` — Chân dung đời thường (mục “Bạn thực sự là ai”)

- [ ] **Lưu thành:** `public/images/report/sage/portrait.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
young woman reading at a wooden desk surrounded by stacks of books, afternoon light streaming through tall windows, floating dust motes, absorbed in thought, the woman is a 26-year-old Vietnamese woman with a chin-length bob, thin gold-rimmed glasses, oatmeal knit sweater and sage green linen trousers, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of parchment ivory, sage green, soft olive, warm oak brown, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 3/5 · `core` — Khoảnh khắc nội tâm (mục “Lõi tính cách”)

- [ ] **Lưu thành:** `public/images/report/sage/core.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
close-up of a woman's hands writing in a leather notebook with a fountain pen, dried eucalyptus sprigs and a ceramic cup of tea on the desk, quiet contemplative mood, the hands belong to a 26-year-old Vietnamese woman with a chin-length bob, thin gold-rimmed glasses, oatmeal knit sweater and sage green linen trousers, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of parchment ivory, sage green, soft olive, warm oak brown, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 4/5 · `love` — Tình yêu (mục “Bạn muốn một tình yêu như nào”)

- [ ] **Lưu thành:** `public/images/report/sage/love.webp`
- **Khung hình:** ngang **4:3** · tối thiểu 1600 × 1200 px · Midjourney thêm `--ar 4:3`
- **Mẹo:** Chỉ thấy rõ mặt cô gái; người kia quay lưng hoặc khuất mặt.

**Prompt — copy nguyên khối:**

```text
two people in deep conversation across a small cafe table with books and coffee, warm late-afternoon light, the woman smiling thoughtfully, partner seen from behind and out of focus, the woman is a young Vietnamese woman in her mid twenties, horizontal 4:3 format, subjects kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of parchment ivory, sage green, soft olive, warm oak brown, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 5/5 · `symbol` — Vật thể 3D điểm nhấn (trôi nổi đầu trang & “Lời khuyên”)

- [ ] **Lưu thành:** `public/images/report/sage/symbol.png`
- **Khung hình:** vuông **1:1** · tối thiểu 1600 × 1600 px · Midjourney thêm `--ar 1:1`
- **Mẹo:** Xuất **PNG nền trong suốt**. Nếu công cụ không tạo được nền trong suốt, tạo trên nền trắng rồi tách nền (remove.bg, Photoshop, Canva…).

**Prompt — copy nguyên khối:**

```text
an elegant crystal hourglass with brushed brass frame and pale sage-green sand, beautiful light refraction through the glass, square 1:1 format, 3D render, single object floating and centered with generous empty margin around it, soft studio lighting with gentle rim light, subtle soft shadow beneath, premium product-visualization style, smooth glossy and frosted materials, color palette of parchment ivory, sage green, soft olive, warm oak brown, isolated on a transparent background, no text, no logo, no watermark
```
