# AGENTS.md

## What this repo is

A **static, build-free car dealership website** ("Apex Precision Automotive" / Apex Motors) implemented from a Google Stitch design export. There is no package manager, bundler, framework, or test suite.

Two top-level directories:

- `stitch_car_sales_dealership_website/` — **Read-only design source** exported from Stitch (11 screen folders, each with `code.html`, `screen.png`, and some with `DESIGN.md`). This is the visual/content reference. Do **not** edit it to change the site.
- `site/` — the actual website. Four hand-authored HTML pages + shared CSS/JS/images.

## Run / preview

No build step. Serve `site/` and open a page:

```bash
cd site && python3 -m http.server 8137
# http://localhost:8137/index.html
```

Opening `site/index.html` via `file://` also works; only the Google Fonts/Material Symbols icon font needs network (system fonts are the fallback).

## Site structure

| File | Tab (`data-page`) | Role |
| --- | --- | --- |
| `site/index.html` | `inventory` | Inventory showroom / home |
| `site/vehicle-details.html` | `detail` | Vehicle details + financing estimator |
| `site/services.html` | `services` | Dealer services & guarantees |
| `site/contact.html` | `support` | Contact / support hub |

- `site/assets/styles.css` — all styling. Design tokens are CSS variables: `:root` = **dark** theme (default), `[data-theme="light"]` = light theme.
- `site/assets/app.js` — one IIFE, all behavior.
- `site/assets/img/` — local copies of the images referenced by the Stitch exports (logo, avatar, vehicle photos, map). Re-download source URLs are embedded in `stitch_car_sales_dealership_website/**/code.html` (look for `lh3.googleusercontent.com`).

## Conventions & gotchas

- **No templating / no includes.** The header, bottom `tabbar`, and `#toast` markup are duplicated in every page. When you change one, change all four.
- **Active tab** is driven by `document.body[data-page]` matched against `.tab[data-path]`. Set `data-page` on `<body>` and `data-path` on each tab.
- **Theme**: an inline `<script>` in each `<head>` applies `localStorage["apex-theme"]` (falling back to `prefers-color-scheme`) **before paint** to avoid a flash. Keep that script in sync across pages. Toggle button: `[data-theme-toggle]`.
- **Icons** use Material Symbols (Google Fonts CDN). Filled glyphs require `class="material-symbols-outlined filled"`; the name goes in the element text (e.g. `<span class="material-symbols-outlined">directions_car</span>`).
- **The site deliberately does NOT use Tailwind.** The Stitch `code.html` files use the Tailwind CDN; the build was rewritten to hand-written CSS in `assets/styles.css`. Do not reintroduce Tailwind or add a CDN dependency.
- **Adding page behavior** in `app.js`: write an `initX()` and guard with an early `return` when its target element is absent (that is how one file serves all four pages). Register it in the `DOMContentLoaded` boot list.
- **Inventory filtering** reads per-card attributes on `.vehicle-card`: `data-category`, `data-price` (integer USD), `data-title`. Category chips and price pills in `index.html` filter against these; a category with no matching card intentionally shows nothing.
- **Financing estimator** (`vehicle-details.html`) recalculates from `#monthly-value[data-price]`, `[data-tier][data-apr]`, `[data-term]`, and `#down-slider`. Keep those hooks if you edit the markup.
- Icons/fonts come from `fonts.googleapis.com`; everything else is local, so the pages work offline except for icon/font glyphs.

## Layout quirks

- The app is a **mobile-first shell**: `.app`, `.appbar`, and `.tabbar` are capped at `--app-max` (520px) and centered; on wide screens the column is framed with side borders.
- `.appbar`/`.tabbar` are `position: fixed`; `.app` pads for both. Pages with the fixed concierge drawer (`body[data-concierge]`) get extra bottom padding — add that attribute if you add the drawer to a page.
- Horizontal scroll rows (`.filter-row`, `.cat-row`, `.gallery__thumbs`) hide their scrollbar and expect their section to use `.section--flush` (zero side padding) so the row can bleed to the edges.

## Verifying changes

No automated tests. Sanity-check by serving the site and confirming each page returns 200 and that no local `src`/`href` is broken, e.g. grep `site/**/*.html` for references and confirm the file exists under `site/`. Headless Chrome is available for smoke checks:

```bash
google-chrome --headless=new --no-sandbox --dump-dom http://localhost:8137/index.html
```
