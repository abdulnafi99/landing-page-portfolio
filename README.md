# Nafi | PwaStudio — Portfolio

Landing page portfolio untuk pembangunan aplikasi web & PWA. Dibina dengan HTML, Vanilla CSS dan Vanilla JavaScript — tiada build step.

## Struktur

| Fail | Kegunaan |
| --- | --- |
| `index.html` | Struktur halaman (hero, tentang, kemahiran, projek, hala tuju, visi, hubungi) |
| `projects.js` | **Data projek** — tambah/ubah projek di sini |
| `script.js` | Render kad projek, penapis, tema gelap/cerah, menu mudah alih, `CONFIG` WhatsApp |
| `styles.css` | Gaya & tema |
| `manifest.webmanifest`, `sw.js`, `icons/` | Sokongan PWA (boleh dipasang & luar talian) |

## Konfigurasi

Buka `script.js` dan isi `CONFIG.whatsappNumber` (cth. `"60123456789"`) untuk memaparkan butang WhatsApp di bahagian Hubungi.

Bila mengubah aset, naikkan versi `CACHE` dalam `sw.js` supaya pelawat mendapat versi terbaru.

## Jalankan secara setempat

```bash
npx serve .
# atau
python3 -m http.server 8000
```

## Deploy

Folder ini boleh terus di-deploy ke **Vercel** atau **Netlify** sebagai laman statik (tiada build command, output directory = root).
