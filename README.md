# Apex Motors — Car Dealership Website

A static, build-free car dealership website built from a Google Stitch design export.

## Structure

- `site/` — the website (open `site/index.html`, or serve the folder).
- `stitch_car_sales_dealership_website/` — original Stitch design export (reference only).

## Run locally

```bash
cd site
python3 -m http.server 8137
# http://localhost:8137/index.html
```

No build step, no dependencies.

## Pages

- `site/index.html` — Inventory showroom
- `site/vehicle-details.html` — Vehicle details + financing estimator
- `site/services.html` — Services & guarantees
- `site/contact.html` — Contact / support

## Deploy

Deployed on [Vercel](https://vercel.com) with the project **Root Directory** set to `site`
(framework preset: **Other**, no build command).

See `AGENTS.md` for contributor notes.
