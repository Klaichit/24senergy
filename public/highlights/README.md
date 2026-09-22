# Highlights images

The home page Highlights section reshuffles on every visit: it shows one
benefit from each of the six products, and three of those land on photo cards
that put their text over the image.

Because any product can land on a photo card, the image is keyed to the
product's **category**, not to one fixed card. Three files cover every
arrangement the shuffle can produce.

## Naming

    public/highlights/bess.webp
    public/highlights/solar.webp
    public/highlights/inverter.webp

| file | shown for | placeholder until then |
|---|---|---|
| `bess.webp` | Sunwoda Atrix Max+, KSTAR, TCL BlueArk X1 | `01.webp` |
| `solar.webp` | Leapton N-Type TOPCon | `02.webp` |
| `inverter.webp` | SolarEdge, Solplanet ASW HT | `04.webp` |

Each photo card sets `--hl-img` above a placeholder layer, so a missing file
falls through and a present one covers it. The three photo cards always take
three different categories, so these never appear side by side as duplicates.

## Format

- **webp**, about **1600 px** wide, under **250 KB**
- The large card is roughly 780 x 515 on desktop and the two small ones
  383 x 225, so a **16:9 or wider** frame crops well in both
- Images crop to `center 30%` with a dark gradient and white text over the
  lower half. **Keep the subject in the upper two thirds** and leave the
  bottom third free of detail, since the text covers it
- Darker, lower-contrast photographs read best; a bright, busy frame fights
  the text even through the gradient

## Adding a product

A new product needs a category image only if its category is new. Add the file
here and extend `HL_PH` in `public/index.html`.
