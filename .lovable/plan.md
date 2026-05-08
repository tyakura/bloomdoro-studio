## Ringkasan perubahan

Semua perubahan dilakukan di frontend kecuali edge function AI (untuk membaca link & sapaan multi-bahasa).

### 1. Background video & YouTube (Settings)
- `SettingsModal.tsx`: input URL video / YouTube untuk **background** sekarang benar-benar dipakai (sebelumnya rusak). Render iframe YouTube fullscreen tanpa kontrol/branding (`controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`) untuk YouTube, atau `<video>` untuk file/link mp4.
- Index.tsx: render lapisan background dukung 3 tipe: image / video file / youtube embed.
- Tombol/ikon "kirim link" di input background & YouTube music diganti label **"Go"**.

### 2. Media note YouTube (StickyNotes)
- Sembunyikan kontrol bawaan YouTube: pakai parameter sama (`controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`). Hanya video yang tampil.

### 3. Persistensi penuh (localStorage, hingga 10 MB)
File baru `src/lib/persist.ts`: helper baca/tulis JSON dengan budget 10 MB; gambar di-resize/compress ke base64 jika perlu.
Yang dipersist:
- Sticky notes & media notes (posisi, ukuran, isi, gambar base64)
- Background custom (image/video URL/base64, opacity, glass, suara)
- Bahasa, volume, ambient, music URL
- History chat AI (sudah ada)

### 4. i18n — Indonesia / English / Arab / Jepang / China
File baru `src/lib/i18n.ts` + context `src/lib/LanguageContext.tsx`:
- Dictionary 5 bahasa untuk seluruh string UI (Settings, TimerSetup, Garden, HelpGuide, StickyNotes menu, ChatHistory, AI placeholder, dll).
- Pemilih bahasa di `SettingsModal`.
- Arah dokumen `dir="rtl"` otomatis untuk Arab.
- Edge function `ai-chat` menerima param `language`; system prompt mengarahkan AI menjawab & menyapa pakai bahasa itu.

### 5. Talk with AI
- **Shift+Enter** baris baru, **Enter** kirim (sekarang Enter selalu kirim).
- **Mode Coding**: tiap code block punya header `bahasa` + tombol salin (ikon `Copy`). Setelah klik → `navigator.clipboard.writeText`, ikon berubah ke `Check` selama 5 detik.
- **Riwayat AI**: tombol **"Lanjutkan mengobrol"** pada item terpilih → membuka jendela chat dengan messages dari history, bisa lanjut chatting normal.
- **Admin shortcut**: jika user mengetik persis `admin120201251`, set flag `window.__bloomdoroAdmin = true` (sampai refresh) dan TimerSetup mengizinkan minimal **1 detik** (sebelumnya 1 menit). AI balas singkat: "Mode admin aktif".
- **Pembuat website**: AI tidak boleh promosi. Hanya jika ditanya "siapa pembuat" → jawab nama + URL.
- **Riset mode**: tetap kirim daftar SOURCES, frontend render link clickable (sudah ada).

### 6. Easter egg
- Trigger waktu diubah dari 5 menit → **10 menit** repeat (file `Index.tsx` / `EasterEggBackground.tsx`).
- HelpGuide: kotak easter egg dihapus (no border, no bg, no icon). Sisakan teks tipis kecil "easter egg dalam sini..." (italic, opacity ~30%). Di atasnya tambah baris kecil: **"Hubungi jika ada saran: attayaarkarna12@gmail.com"**.

### 7. Roket
- `GrowingRocket.tsx`: saat fase 0.95–1.0, roket **berhenti di tengah** (di dekat bulan), tidak terbalik (sudah tidak terbalik), api mati (sudah). Pastikan posisi `rocketY` tidak melompat — interpolasi halus di tengah.

### Detail teknis singkat
- File baru: `src/lib/i18n.ts`, `src/lib/LanguageContext.tsx`, `src/lib/persist.ts`.
- File diubah: `SettingsModal.tsx`, `StickyNotes.tsx`, `Index.tsx`, `HelpGuide.tsx`, `ChatHistory.tsx`, `TimerSetup.tsx`, `MusicPlayer.tsx`, `GrowingRocket.tsx`, `EasterEggBackground.tsx`, `App.tsx` (provider), `supabase/functions/ai-chat/index.ts`.
- Tidak ada perubahan database.
- Kuota persist 10 MB ditegakkan di helper; gambar besar dikompres sebelum simpan.
