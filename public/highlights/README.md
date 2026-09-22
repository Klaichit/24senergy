# Highlights images

Three cards in the home page Highlights section put their text over a photo.
Drop a file here and that card picks it up — no code change, no rebuild.

## Naming

    public/highlights/<key>.webp

| file | card | placeholder until then |
|---|---|---|
| `backup-transfer.webp` | ไฟดับแล้วกลับมาในเสี้ยววินาที (large) | `01.webp` |
| `scale-up.webp` | เริ่มเท่าที่จำเป็น แล้วค่อยขยาย | `04.webp` |
| `panel-durability.webp` | แผงที่เสื่อมช้าและทนหน้างานหนัก | `02.webp` |

Each card sets `--hl-img: url('highlights/<key>.webp')` above the placeholder
layer, so a missing file falls through and a present one covers it.

## Format

- **webp**, about **1600 px** wide, under **250 KB**
- The large card is roughly 780 x 515 on desktop, the two small ones 383 x 225,
  so a **16:9 or wider** frame crops well in both
- Images crop to `center 30%` and carry a dark gradient with white text over
  the lower half. **Keep the subject in the upper two thirds** and avoid
  detail in the bottom third, which the text covers
- Darker, lower-contrast photographs read best; a bright, busy frame fights
  the text even with the gradient
