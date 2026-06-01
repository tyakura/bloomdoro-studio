# Rencana Perubahan

## 1. Bug: Settings langsung tertutup sendiri
**Akar masalah**: `SettingsModal` berada di dalam `<PopoverContent>` (UserMenu). Saat klik tombol Settings, event bubble ke `onClick={() => setOpen(false)}` di `UserMenu`, yang menutup popover — dan karena modal Settings juga di-unmount bersama popover, modal ikut hilang.

**Fix**:
- Pindahkan rendering `SettingsModal` (dan modal lain seperti Garden/History) ke level `Index.tsx`, BUKAN sebagai child popover.
- `UserMenu` hanya berisi tombol pemicu yang memanggil prop `onOpenSettings`, `onOpenGarden`, `onOpenHistory`.
- Tambahkan `e.stopPropagation()` di tombol-tombol di dalam popover sebagai pengaman.

## 2. Logout di Settings
- Tambahkan section "Akun" di `SettingsModal` (hanya jika `user`): nama + email + tombol "Keluar" → `supabase.auth.signOut()`.
- Hapus tombol logout duplikat dari `UserMenu` (opsional, biarkan keduanya).

## 3. Foto profil
- Buat bucket storage `avatars` (public) via migration + RLS policy (user hanya bisa upload/update file di folder `{auth.uid()}/`).
- Di `SettingsModal` section Akun: avatar bulat + tombol upload → upload ke `avatars/{user.id}/avatar.jpg` → update `profiles.avatar_url`.
- `UserMenu` tampilkan avatar bila ada, fallback ke inisial.

## 4. Header mobile "atap Bloomdoro"
- Komponen baru `MobileTimerHeader` (sticky top, hanya mobile, hanya saat `phase === "focus" | "break"`).
- Isi: timer mm:ss kiri, mini animasi bunga/roket kanan (versi kecil dari GrowingFlower/Rocket via prop `size`).
- Hilang otomatis saat `phase === "setup" | "complete"`.

## 5. Fitur Medsos saat istirahat
- Tambah toggle di `TimerSetup` (di bawah input waktu istirahat): "Istirahat dengan medsos?" (disable bila break = 0).
- State `breakWithSocial: boolean` disimpan di `localStorage` + diteruskan ke `handleStart`.
- Saat `phase === "break"` dan toggle aktif → render `SocialBreakPanel` overlay split-screen 50/50:
  - Kiri: timer & kontrol existing (compact).
  - Kanan: tab Instagram / YouTube / TikTok / Facebook / LinkedIn.
- **Implementasi panel kanan** (karena IG/TikTok/FB/LinkedIn memblokir iframe penuh):
  - YouTube: embed iframe penuh (feed/subscriptions butuh login YT — tampilkan halaman home embed atau input channel).
  - Lain-lain: tampilkan tombol "Buka di tab baru" + URL input untuk profil/feed favorit user. Tersimpan per-user (di `user_settings.social_links` jsonb) bila login, atau localStorage bila belum.
- Panel auto-tutup saat break selesai.

## 6. Batas drag di desktop (navbar guard)
- Di `StickyNotes.tsx` (dan komponen Media/AI box yang draggable), saat drag di **desktop** (`!isMobile`):
  - Hitung tinggi header (mis. ref atau const `HEADER_HEIGHT = 72`).
  - Clamp `y >= HEADER_HEIGHT` di handler pointer-move sehingga kotak tidak bisa ditarik ke atas navbar.
- Tidak diterapkan di mobile (mobile pakai fullscreen sheet).

---

## Bagian Teknis

**File baru:**
- `src/components/MobileTimerHeader.tsx`
- `src/components/SocialBreakPanel.tsx`
- `src/components/AvatarUpload.tsx` (kecil, dipakai di SettingsModal)

**File diedit:**
- `src/pages/Index.tsx` — lift modal state, render MobileTimerHeader + SocialBreakPanel, teruskan `breakWithSocial` ke flow break.
- `src/components/UserMenu.tsx` — ganti children jadi prop callbacks, jangan render modal anak.
- `src/components/SettingsModal.tsx` — tambah section Akun (avatar + logout).
- `src/components/TimerSetup.tsx` — tambah toggle "istirahat dengan medsos".
- `src/components/StickyNotes.tsx` — clamp y di drag handler desktop.
- `src/hooks/useAuth.tsx` — (opsional) expose helper refresh profile.

**Migrations:**
1. Buat bucket `avatars` public + storage policies (user CRUD folder sendiri, semua bisa SELECT).
2. Tambah kolom `social_links jsonb` di `user_settings`.

**Catatan UX:**
- Toggle "istirahat dengan medsos" hanya muncul jika break > 0.
- SocialBreakPanel di mobile menumpuk vertikal (atas timer, bawah medsos) karena layar sempit.
- Header mobile pakai `backdrop-blur` + transparan agar tidak menutup background user.
