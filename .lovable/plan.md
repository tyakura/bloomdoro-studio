# Rencana Update Bloomdoro

## 1. Otentikasi (Lovable Cloud)
- Aktifkan Email/Password + Google sign-in (auto-confirm email ON agar tidak perlu verifikasi).
- Buat halaman `/auth` dengan form Sign in / Sign up + tombol "Sign in with Google".
- Tambah tabel `profiles` (id, user_id, display_name, avatar_url) + trigger auto-insert saat signup. RLS: user hanya akses data sendiri.
- Header utama: jika belum login tampilkan tombol **Login / Sign in** dan **Nanti**; jika login tampilkan avatar + menu logout.
- Tambah banner kecil di tampilan awal: "Login untuk pengalaman lebih: simpan musik, background, ambient, dan riwayat AI lintas device."

## 2. Reorganisasi Settings
Pindahkan dari Settings (yang sebelumnya untuk semua user) ke **menu user setelah login**:
- Background upload + URL
- Upload Music + YouTube link
- Ambient Sound
- Riwayat AI (Chat History)

Yang **tetap** di Settings tampilan awal (tanpa login):
- Dark mode, Bahasa, Volume, Garden, Overlay/Glass opacity (kalau ada bg default)

User belum login yang coba akses fitur ini → modal "Login dulu untuk pakai fitur ini" dengan tombol Login / Nanti.

## 3. Penyimpanan Data
- **Belum login**: semua data (sticky notes, media, talk with AI, background) tetap di **localStorage** (seperti sekarang).
- **Sudah login**: tabel Cloud untuk sinkron lintas device:
  - `user_settings` (background_url, background_kind, music_url, ambient, volume, language, glass_opacity, overlay_opacity)
  - `sticky_notes` (content, position, color, media_url, media_kind)
  - `chat_sessions` + `chat_messages` (riwayat AI)
  - `garden_progress` (jumlah sesi sukses)
- Saat login pertama kali: tawarkan migrasi data localStorage ke akun.
- Semua tabel pakai RLS `auth.uid() = user_id`.

## 4. Talk with AI — Upload File & Konversi
- Tombol `+` di kiri input sudah ada → perluas: terima PDF, DOCX, TXT, MD, gambar (PNG/JPG).
- Saat user kirim file, AI otomatis menanyakan: **"File ini ingin diapakan? (ringkas, terjemahkan, ubah ke format lain seperti PDF/DOCX/TXT/MD, ekstrak teks/OCR, dll.)"**
- Edge function baru `process-file`:
  - PDF → ekstrak teks (pdf-parse di Deno)
  - DOCX → ekstrak teks
  - Gambar → kirim ke Gemini Vision untuk OCR
  - Hasil dimasukkan ke konteks chat
- Saat user minta konversi keluar (mis. "ubah ke PDF"), edge function generate file dan kirim balik sebagai download link (Supabase Storage bucket `ai-exports`, public read 24 jam).
- Format yang didukung output: PDF, DOCX, TXT, MD.

## 5. Mobile: Talk with AI Fullscreen
- Saat HP (≤768px) buka Talk with AI → halaman fullscreen menggantikan tampilan utama.
- Header sticky atas (tinggi ~25% layar HP, lebar penuh kiri-kanan):
  - Kiri: tanda panah ← (kembali ke tampilan awal)
  - Tengah-kiri: logo Bloomdoro AI + nama
  - Isi kotak: timer countdown live + animasi bunga/roket yang sedang tumbuh (mini, real-time seperti live streaming)
- Sisanya (75% layar): chat penuh dengan input di bawah.
- Desktop tetap seperti sekarang (panel/popup).

## 6. Hapus Mode Admin
- Hapus shortcut `admin120201251` dari `ai-chat` edge function & dari `TimerSetup` (tidak ada lagi timer 1 detik).
- Hapus pengecekan `window.__bloomdoroAdmin`.

## 7. Hal Kecil
- Banner login muncul sekali per session (bisa di-dismiss).
- Tombol "Nanti" menutup banner & menyimpan dismissal di localStorage.
- Update HelpGuide: tambahkan bagian "Login & Sinkron" dan "Konversi File AI".

## Catatan Teknis
- File baru: `src/pages/Auth.tsx`, `src/pages/MobileAIChat.tsx`, `src/components/AuthBanner.tsx`, `src/components/UserMenu.tsx`, `src/hooks/useAuth.tsx`, `src/lib/cloudSync.ts`, `supabase/functions/process-file/index.ts`.
- Migrasi DB: profiles, user_settings, sticky_notes, chat_sessions, chat_messages, garden_progress, storage bucket `ai-exports`.
- Hapus admin code dari: `supabase/functions/ai-chat/index.ts`, `src/components/TimerSetup.tsx`, `src/components/StickyNotes.tsx` (jika ada).