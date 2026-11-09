# Nafi | PwaStudio — Portfolio

Bento-style portfolio for app & PWA development. Plain HTML, vanilla CSS and vanilla JavaScript — no build step.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure: hero, about & skills, work, focus areas, vision & contact (all bento grids) |
| `projects.js` | **Project data.** Add or edit projects here; `size` (`xl`, `wide`, `tall`) sets the tile size; apps with a `link` appear in the live phone carousel |
| `skills.js` | **Skills carousel data** — name, brand colour, proficiency `level` (edit to your own rating) and icon path |
| `script.js` | Project tiles, filter animation, detail dialog, scroll-spy nav, theme toggle, `CONFIG` for WhatsApp |
| `styles.css` | Styles, light/dark theme tokens |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA support (installable, offline) |

## Config

Set `CONFIG.whatsappNumber` in `script.js` (e.g. `"60123456789"`) to show the WhatsApp button in the contact tile.

When you change assets, bump `CACHE` in `sw.js` so returning visitors get the new version.

## Run locally

```bash
python3 -m http.server 8000
```

## Deploy

Connected to Vercel: every push to `main` deploys to production; other branches get preview URLs.
