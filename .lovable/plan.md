
# Hapus Semua Fitur Sosmed

User ingin menghapus seluruh fitur social media dari aplikasi, termasuk yang muncul saat istirahat (break).

## Yang akan dihapus

### 1. File yang dihapus
- `src/components/SocialBreakPanel.tsx` — panel emulator IG/YouTube/TikTok/FB/LinkedIn
- `src/lib/socialPopup.ts` — helper popup sosmed

### 2. `src/components/TimerSetup.tsx`
- Hapus import `Share2`, `Instagram`, `Youtube`, `Music2`, `openSocialPopup`, `SocialPlatform`
- Hapus konstanta `SOCIAL_ICONS`
- Hapus prop `defaultBreakWithSocial` dan parameter `breakWithSocial` dari `onStart`
- Hapus state `breakWithSocial` dan tombol toggle Share2 di header break card
- Hapus baris ikon sosmed (Instagram/TikTok/YouTube) di break card
- Hapus blok tip `break_social_tip`
- Update signature `onStart` jadi 4 argumen

### 3. `src/components/StickyNotes.tsx`
- Hapus item menu "Sosmed" pada FAB (+) beserta sub-row ikon sosmed
- Hapus import & pemakaian `openSocialPopup`/ikon sosmed

### 4. `src/pages/Index.tsx`
- Hapus state & logika `breakWithSocial`, `showSocialPanel`
- Hapus render `<SocialBreakPanel />`
- Hapus pembukaan panel sosmed saat break mulai
- Sesuaikan pemanggilan `onStart` (4 argumen)
- Hapus prop `defaultBreakWithSocial`

### 5. `src/components/SettingsModal.tsx`
- Hapus toggle/opsi terkait sosmed/break-with-social bila ada
- Hapus persist key terkait

### 6. `src/components/HelpGuide.tsx`
- Hapus seksi/paragraf yang menjelaskan fitur sosmed saat istirahat

### 7. `src/components/MobileAIChat.tsx` (jika ada referensi)
- Tidak ada perubahan kecuali ada referensi sosmed

### 8. `src/lib/i18n.tsx`
- Hapus key i18n: `break_with_social_tip`, `break_social_tip`, `medsos_on`, `medsos_off`, `social_open_original`, dan key lain yang khusus untuk sosmed di semua bahasa (id/en/ar/ja/zh)

### 9. `src/lib/persist.ts` (jika menyimpan preferensi sosmed)
- Bersihkan key yang tidak lagi dipakai

## Yang tidak diubah
- Timer, garden, sticky notes (selain item Sosmed), AI chat, file upload/PDF conversion, music player, ambient sounds, settings lain — tetap seperti sekarang.

## Verifikasi
- Pastikan tidak ada import yang menggantung
- Build bersih, tidak ada referensi ke `SocialBreakPanel`, `openSocialPopup`, atau `breakWithSocial`
