# 12 · The Explorer — Nhà Thám Hiểm

*Mood:* **Desert Horizon** · *Bảng màu:* warm sand, sky blue, sun-bleached cream, caramel

*Nhân vật (dùng chung cho hero, portrait, core):* khoảng 24 tuổi, da rám nắng, tóc gợn sóng dưới mũ cói, trang phục utility màu cát.

Lưu cả 5 ảnh vào thư mục **`public/images/report/explorer/`**. Xong thì chạy `npm run images:status` để kiểm tra.

**Negative prompt** (nếu công cụ có ô này — dùng chung cho cả 5 ảnh):

```text
text, watermark, logo, signature, extra fingers, deformed hands, distorted face, harsh shadows, black background, dark moody lighting, neon colors, oversaturated, plastic skin, celebrity likeness, cluttered background
```

---

## Ảnh 1/5 · `hero` — Chân dung bìa (đầu trang)

- [ ] **Lưu thành:** `public/images/report/explorer/hero.webp`
- **Khung hình:** ngang **16:9** · tối thiểu 2400 × 1350 px · Midjourney thêm `--ar 16:9`
- **Lưu ý:** ảnh này làm **nền tràn toàn màn hình**, chữ tiêu đề nằm bên trái — giữ nửa trái thoáng.
- **Mẹo:** Tạo ảnh này **trước tiên**. Ảnh ưng ý rồi thì dùng nó làm **ảnh tham chiếu nhân vật** cho `portrait` và `core` để giữ cùng một gương mặt (Midjourney: thêm `--cref <link ảnh hero>`; công cụ khác: tải ảnh hero lên làm reference).

**Prompt — copy nguyên khối:**

```text
adventurous young woman in a straw hat standing in the right third of the frame on a coastal cliff at golden hour, wind in her wavy hair, the left half is open pale sky and soft sea haze as negative space, sky blue and sand tones, free spirited gaze, the woman is a 24-year-old sun-kissed Vietnamese woman with wavy hair under a straw hat, wearing a sand-colored utility outfit, wide horizontal 16:9 format, the woman placed in the right third of the frame, the left half is calm soft negative space for a headline, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of warm sand, sky blue, sun-bleached cream, caramel, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 2/5 · `portrait` — Chân dung đời thường (mục “Bạn thực sự là ai”)

- [ ] **Lưu thành:** `public/images/report/explorer/portrait.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
young woman with a canvas backpack walking along sand dunes under a wide pale-blue sky, small figure in a vast landscape, the woman is a 24-year-old sun-kissed Vietnamese woman with wavy hair under a straw hat, wearing a sand-colored utility outfit, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of warm sand, sky blue, sun-bleached cream, caramel, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 3/5 · `core` — Khoảnh khắc nội tâm (mục “Lõi tính cách”)

- [ ] **Lưu thành:** `public/images/report/explorer/core.webp`
- **Khung hình:** dọc **4:5** · tối thiểu 1200 × 1500 px · Midjourney thêm `--ar 4:5`
- **Mẹo:** Dùng ảnh `hero` làm ảnh tham chiếu nhân vật.

**Prompt — copy nguyên khối:**

```text
close-up of a woman's hands holding a vintage map and a brass compass over an open travel journal, the hands belong to a 24-year-old sun-kissed Vietnamese woman with wavy hair under a straw hat, wearing a sand-colored utility outfit, vertical 4:5 portrait format, subject kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of warm sand, sky blue, sun-bleached cream, caramel, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 4/5 · `love` — Tình yêu (mục “Bạn muốn một tình yêu như nào”)

- [ ] **Lưu thành:** `public/images/report/explorer/love.webp`
- **Khung hình:** ngang **4:3** · tối thiểu 1600 × 1200 px · Midjourney thêm `--ar 4:3`
- **Mẹo:** Chỉ thấy rõ mặt cô gái; người kia quay lưng hoặc khuất mặt.

**Prompt — copy nguyên khối:**

```text
couple sitting at the open door of a vintage camper van at sunset by the sea, the woman laughing, partner seen from behind, the woman is a young Vietnamese woman in her mid twenties, horizontal 4:3 format, subjects kept away from the edges, editorial lifestyle photography, high-end magazine aesthetic like Kinfolk and Vogue Living, shot on 85mm lens, soft natural light, gentle film grain, creamy shallow depth of field, airy and luminous, light and bright overall exposure, color palette of warm sand, sky blue, sun-bleached cream, caramel, natural skin texture, elegant and calm, no text, no logo, no watermark
```

---

## Ảnh 5/5 · `symbol` — Vật thể 3D điểm nhấn (trôi nổi đầu trang & “Lời khuyên”)

- [ ] **Lưu thành:** `public/images/report/explorer/symbol.png`
- **Khung hình:** vuông **1:1** · tối thiểu 1600 × 1600 px · Midjourney thêm `--ar 1:1`
- **Mẹo:** Xuất **PNG nền trong suốt**. Nếu công cụ không tạo được nền trong suốt, tạo trên nền trắng rồi tách nền (remove.bg, Photoshop, Canva…).

**Prompt — copy nguyên khối:**

```text
an antique brass compass with a sky-blue glass face, polished and glowing softly, square 1:1 format, 3D render, single object floating and centered with generous empty margin around it, soft studio lighting with gentle rim light, subtle soft shadow beneath, premium product-visualization style, smooth glossy and frosted materials, color palette of warm sand, sky blue, sun-bleached cream, caramel, isolated on a transparent background, no text, no logo, no watermark
```
