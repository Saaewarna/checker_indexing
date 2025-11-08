
# Index Checker Bot (CLI)

Alat CLI sederhana buat ngecek **perkiraan jumlah URL terindeks** untuk setiap **direktori** di situs kamu, mirip hitungan `site:` di Google seperti di screenshot.

Default backend: **SerpAPI** (paling gampang). Alternatif: **Google Programmable Search (CSE)**.

> ⚠️ Catatan: Meng-scrape hasil Google langsung melanggar ToS. Tool ini pakai API resmi/penyedia SERP agar aman & stabil.

---

## Setup

1. **Install Node.js** (v18+).
2. Ekstrak folder ini, lalu:
   ```bash
   npm i
   ```

### Pilih Backend

#### Opsi A — SerpAPI (paling simpel)
- Daftar & ambil API key: https://serpapi.com/
- Set environment variable:
  - macOS/Linux:
    ```bash
    export SERPAPI_KEY="ISI_API_KEY_KAMU"
    ```
  - Windows PowerShell:
    ```powershell
    setx SERPAPI_KEY "ISI_API_KEY_KAMU"
    ```

#### Opsi B — Google Custom Search (CSE)
- Buat API Key: https://console.cloud.google.com/apis/credentials
- Buat **Programmable Search Engine**: https://programmablesearchengine.google.com/
- Set agar **mencari di keseluruhan web**, bukan hanya site list.
- Catat `cx` (Search engine ID).
- Set env var:
  ```bash
  export GOOGLE_API_KEY="..."
  export GOOGLE_CSE_ID="..."
  ```

---

## Cara Pakai

Cek otomatis direktori dari **sitemap** (kalau ada):
```bash
npx . index-checker --domain brainfactory.co.in
# atau: node index.js --domain brainfactory.co.in
```

Tetapkan direktori manual (comma-separated):
```bash
node index.js --domain brainfactory.co.in --dirs /info,/blog,/news
```

Pakai backend CSE:
```bash
node index.js --domain brainfactory.co.in --engine cse
```

Throttle/delay antar query (detik, default 1.2):
```bash
node bulk-domains.js --domains-file domains.txt --out domains-results.txt --concurrency 3 --delay 1
```

Output contoh:
```
🌐 Domain: https://brainfactory.co.in
⚙️  Engine: serpapi

site:https://brainfactory.co.in/info            → 4,840 hasil
site:https://brainfactory.co.in/blog            → 120 hasil
...

≈ Perkiraan total (gabungan per-dir) : 4,960
Note: Angka ini mengikuti estimasi dari mesin pencari dan dapat berubah.
```

---

## Kenapa angka bisa beda?
- Google menampilkan **perkiraan** total, bukan angka pasti.
- Index berubah dinamis.
- Setelan CSE/region/language bisa mempengaruhi.
- SerpAPI/CSE bisa memberi angka yang sedikit berbeda dari UI.

---

## Tips
- Biar lebih akurat per direktori, pastikan sitemap url lengkap dan update.
- Kalau situs besar, batasi jumlah direktori manual via `--dirs` supaya lebih cepat.
- Hindari delay terlalu kecil biar tidak kena rate limit API.

---

## Lisensi
MIT
