# Rencana Perubahan

## 1. Mobile: Live preview hanya saat Talk with AI
- `MobileTimerHeader` saat ini selalu muncul di mobile saat focus/break. Ubah agar hanya muncul saat `MobileAIChat` terbuka (live preview ada di header chat).
- Hapus `MobileTimerHeader` dari layout utama mobile; pindahkan / pastikan animasi (bunga/roket) hanya tampil di header `MobileAIChat`.
- Perkecil animasi bunga/roket lebih jauh (scale ~0.35 + max-width clamp) supaya muat di header 25vh tanpa overflow horizontal. Tambah `overflow-hidden` dan `flex-shrink`.

## 2. Settings: terjemahkan teks yang masih Indonesia
- Audit `SettingsModal.tsx` (label "Akun", "Bahasa", "Background", "Musik", "Ambient", "Overlay", "Glass", "Keluar", "Upload", placeholder URL, tombol Go, dll) dan ganti hardcoded string ke `t("...")`.
- Tambah key baru di `src/lib/i18n.tsx` untuk semua bahasa: id, en, ar, ja, zh. Lakukan hal sama untuk `TimerSetup` (toggle "Istirahat dengan medsos?"), `UserMenu`, `SocialBreakPanel`, `MobileAIChat` (placeholder, tombol).

## 3. AI: Upload file → tanya tujuan + konversi banyak format
- Saat user upload file di `MobileAIChat` dan AI box desktop:
  - Setelah ekstraksi sukses, tampilkan pesan asisten + grid tombol aksi: Ringkas, Terjemahkan, Jelaskan, Konversi ke …, Tanya bebas.
  - Klik "Konversi ke …" memunculkan picker format target tergantung sumber:
    - PDF → DOCX, TXT, MD, HTML, RTF, ODT, EPUB, gambar (PNG per page)
    - DOCX → PDF, TXT, MD, HTML, RTF, ODT
    - Image → PDF, TXT (OCR), MD, DOCX
    - TXT/MD → PDF, DOCX, HTML, RTF
- Perluas edge function `process-file/index.ts` `action: "convert"`:
  - Tambah format: `docx` (pakai `docx` npm via esm.sh), `rtf` (template plain), `odt` (template minimal), `epub` (pakai `epub-gen-memory`), `png` (untuk pdf→png pakai pdfium / unpdf render). Untuk format yang sulit di Deno, fallback ke HTML printable dengan nama ekstensi target + catatan.
  - Validasi: tolak kombinasi yang tidak didukung dengan pesan jelas.
- UI: tambah komponen kecil `FileActionBar` di MobileAIChat dan AI desktop yang render setelah `extractedText` tersedia.

## 4. Batas drag: kanan/kiri/bawah maksimal 1/4 layar
- Di `StickyNotes.tsx` dan kotak Media/AI (desktop draggable):
  - Hitung viewport `vw`, `vh`.
  - Clamp posisi sehingga elemen tidak bisa keluar lebih dari `vw/4` ke kiri/kanan dan `vh/4` ke bawah dari area visible (artinya minimal 3/4 elemen harus tetap terlihat di area itu). Atas tetap clamp di bawah navbar (sudah ada).
  - Terapkan di handler `onPointerMove` untuk ketiga kotak.

## 5. Tombol istirahat: toggle ikon untuk Medsos
- Di kotak/area break (TimerSetup saat phase=break atau panel break aktif), ganti toggle text "Istirahat dengan medsos?" menjadi tombol ikon kecil (icon `Globe`/`Share2`) yang bisa di-toggle on/off. Tooltip menampilkan label terjemahan.
- State `breakWithSocial` tetap dipersist seperti sebelumnya.

## 6. Social panel: emulator UI medsos
- Resize `SocialBreakPanel`:
  - Desktop: lebar = 1/3 viewport, tinggi mulai dari **bawah navbar** sampai bawah layar (top: `var(--nav-h, 64px)`), dock di kanan. Avatar/profile di header tetap terlihat karena tidak menutup navbar.
  - Mobile: 1/3 tinggi layar dock di bawah, atau full-width 1/3 height; tetap tidak menutup header.
- Saat aktif: geser kotak lain (Timer, Sticky, Media, AI) ke kiri dan kecilkan (skala 0.85 + translateX) lewat class `body[data-social-open=true]` + transisi.
- Ganti isi panel jadi "emulator" tab/aplikasi:
  - Tab bar atas dengan icon Instagram / YouTube / TikTok / Facebook / LinkedIn.
  - Setiap tab merender UI **bawaan in-app** (komponen mock React yang menyerupai feed asli — bukan iframe situs aslinya): contoh stories+posts untuk IG, video card list untuk YouTube, vertical reels untuk TikTok, feed untuk FB, post list untuk LinkedIn. Data dummy lokal supaya tetap berjalan offline tanpa cors/login.
  - Tambahkan tombol "Buka asli di tab baru" sebagai opsi sekunder.
- File baru: `src/components/social/InstagramApp.tsx`, `YouTubeApp.tsx`, `TikTokApp.tsx`, `FacebookApp.tsx`, `LinkedInApp.tsx`. Semua pure presentational + i18n.

## 7. HelpGuide: intro "Apa itu Bloomdoro"
- Di atas list FAQ pada `HelpGuide.tsx`, tambahkan blok intro:
  - Judul kecil + paragraf: "Bloomdoro adalah aplikasi Pomodoro …" lalu deskripsi singkat (fokus, istirahat, garden, AI, medsos break, kustomisasi).
- Terjemahkan via key baru `guide_intro_title`, `guide_intro_body` untuk 5 bahasa.

---

## Bagian Teknis

**File baru**
- `src/components/social/{InstagramApp,YouTubeApp,TikTokApp,FacebookApp,LinkedInApp}.tsx`
- `src/components/FileActionBar.tsx`

**File diedit**
- `src/pages/Index.tsx` — hapus pemakaian `MobileTimerHeader` di layout utama, set `data-social-open` di body, render `SocialBreakPanel` dock kanan.
- `src/components/MobileAIChat.tsx` — animasi & timer header tetap (sudah ada), kecilkan animasi, sisipkan `FileActionBar`.
- `src/components/SocialBreakPanel.tsx` — refactor jadi emulator tabs + sizing baru.
- `src/components/TimerSetup.tsx` — toggle medsos jadi icon button + i18n.
- `src/components/StickyNotes.tsx` (dan logic Media/AI box) — clamp 1/4 viewport.
- `src/components/SettingsModal.tsx` — ganti hardcoded ke `t()`.
- `src/components/HelpGuide.tsx` — tambah intro.
- `src/lib/i18n.tsx` — tambah key baru untuk 5 bahasa.
- `supabase/functions/process-file/index.ts` — tambah format konversi (docx, rtf, odt, epub, png) + validasi.

**Migrations**: tidak ada.

**Catatan UX**
- Saat `breakWithSocial` aktif & break dimulai → otomatis buka SocialBreakPanel; tutup otomatis saat break selesai.
- Emulator menggunakan data dummy lokal (bukan API resmi) supaya tidak butuh login/izin.
- Pada mobile, social panel tidak menggeser kotak lain (layar terlalu kecil); cukup overlay di 1/3 bawah.
