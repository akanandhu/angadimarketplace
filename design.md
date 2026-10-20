# Design — Angadi Marketplace

Locked design system for `apps/web`. Every page redesign reads this file before emitting code.
Extend or amend it when the system needs to grow; do not restyle pages ad hoc.

Reference DNA: OLX (structure only, never pixels): a dense listing grid, clear prices, a two-tier
header with a quick-filter strip, and one obvious Sell button. Kerala-first: districts are shown as
KL registration plates, and the footer closes on the name in Malayalam.

Audience: mostly 30+, from Kerala. The tone is calm and trustworthy, not loud. No neo-brutalism:
no thick ink outlines, no hard offset shadows, no press-flat buttons.

## Genre
Editorial, calm marketplace register. Hairlines, soft shadows, rounded corners. No glass.

## Macrostructure family
- Home: Ecosystem Index. Search-first hero + budget shortcuts → Just listed → district plates →
  brand index → ad slot → sell band.
- Discovery (browse, dealer): Catalogue. Sticky filter rail + uniform card grid.
- Listing detail: Split. Gallery + spec sheet on the left, sticky soft-shadow price panel right.
- App pages (sell, requests, profile, admin): function first, no enrichment.

## Theme (tokens live in `apps/web/src/app/globals.css` `@theme`)
| Token | Value | Role |
| --- | --- | --- |
| `--color-canvas` | `oklch(96.8% 0.006 195)` | paper |
| `--color-surface` | `oklch(99.5% 0.002 195)` | cards, header |
| `--color-ink` | `oklch(26% 0.05 200)` | backwater-teal text, primary fill |
| `--color-ink-soft` | `oklch(36% 0.045 200)` | secondary text, hover |
| `--color-muted` | `oklch(48% 0.022 200)` | meta text |
| `--color-line` / `-strong` | `oklch(90.5% 0.01 195)` / `oklch(80% 0.016 195)` | hairlines |
| `--color-brand` | `oklch(48% 0.12 162)` | palm green: links, "Negotiable", focus |
| `--color-gold` | `oklch(84% 0.16 86)` | turmeric: Sell, Dealer tag, underlines |
| `--color-gold-soft` | `oklch(95.5% 0.045 92)` | hover wash, sell band |

Turmeric is a highlighter, never a section fill, except the single sell band on home.
Footer wordmark uses `--color-ink-soft` on `--color-ink` (tone-on-tone).
WhatsApp/Call buttons keep their recognisable greens.

## Typography
- Display: Bricolage Grotesque 600/700 (`font-display`), applied to h1–h3, prices and the wordmark.
- Body: Geist 400–600 (`font-sans`). Body copy 15–17px; meta text never below 12px.
- Outlier: Anek Malayalam, bold, `font-stretch: 125%` (`font-malayalam`). **Only** the footer
  wordmark അങ്ങാടി. Not preloaded.
- Prices use the `price` utility (display 700, tabular nums, tight tracking).
- Headings are always roman. No italic emphasis words.

## Signature components
- `Plate` (`components/ui/plate.tsx`): number-plate tag in Geist tabular. RTO code only.
- `SellButton`: turmeric pill with a soft shadow. The only yellow button in the header.
- `SearchBar`: one joined field (query | district | inset ink button). `hero` = 56px, soft shadow.
- Footer `MalayalamWordmark`: edge-to-edge അങ്ങാടി sized with `18cqi` (the word renders ~5.4×
  its font size), bleeding ~10% off the bottom edge.
- `DistrictStrip`: second header tier on public pages; scrolls away (only the top tier is sticky).
- `ListingCard`: hairline + soft shadow, shadow deepens on hover (one signal, no lift). Dealer =
  turmeric pill on the photo. Footer row: district or dealer name + time ago, 12px.

## Shape and spacing
- Radius: card 12px, input/button 10px, plate 4px. Pills for chips, Sell and Login.
- Rules: 1px `line` hairlines only. Emphasis comes from `shadow-card` / `shadow-raised`, not borders.
- Container: `max-w-[1320px] px-4 md:px-6`. Full-bleed bands put padding on the inner container.

## Buttons
- `primary`: ink fill, surface text. Main action on every screen (Request contact, Publish).
- `secondary`: 1px ink outline.
- `outline`: hairline, ink border on hover. `gold`: turmeric fill; at most one per view.
- Labels never wrap (`whitespace-nowrap`).

## Motion
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. Colour transitions and the arrow nudge on budget rows.
- No scroll reveals, no hover lifts, no glass. `prefers-reduced-motion` collapses all transitions.

## Copy
- Concrete and local. "Just listed", "Cars near you", "Shop by budget".
- Never invent counts or stats; only show real `meta.total` numbers.
- Privacy promise is the core claim: the seller's number is shared only if they approve.
