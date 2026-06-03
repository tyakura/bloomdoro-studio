# Plan

## 1. Social media shortcuts (FAB + Break card)

Goal: open Instagram / TikTok / YouTube in a slim floating popup (`window.open(url, '_blank', 'popup=yes,width=450,height=750')`), since most sites block iframe embedding.

Shared helper `src/lib/socialPopup.ts`:
- `SOCIAL_LINKS = { instagram, tiktok, youtube, facebook, linkedin }`
- `openSocialPopup(platform)` calls `window.open(url, '_blank', 'popup=yes,width=450,height=750,noopener')`.

FAB menu (`StickyNotes.tsx`):
- Add a new `FabItem` "Sosmed" that toggles a sub-row of small icon buttons (IG, TikTok, YouTube, FB, LinkedIn).
- Each icon button has `title={t("break_with_social_tip")}` for hover tooltip and calls `openSocialPopup(...)`.

Break card (`TimerSetup.tsx`):
- Under the break presets, render a row of icon buttons (IG, TikTok, YouTube). Each: rounded button, brand color on hover, `title={t("break_with_social_tip")}` tooltip, click → `openSocialPopup`.
- Keep the existing `breakWithSocial` toggle (it controls the in-app emulator panel auto-open).

New i18n key: `break_with_social_tip` = "Istirahat dengan Sosmed" / "Break with social media" / … (all 5 langs).

## 2. Full internationalization pass

Audit every visible string and route it through `t(...)` from `src/lib/i18n.tsx`. Add missing keys for all 5 langs (id, en, ar, ja, zh).

Files to fix (still hard-coded Indonesian):
- `TimerSetup.tsx`: "Set Your Focus Time", "Pilih Tema Animasi", "Bunga Tumbuh", "Roket ke Bulan", "minutes", "Tambahkan Waktu Istirahat", "Repeat …", "Break Time", "Medsos ON/OFF", "Medsos otomatis terbuka saat istirahat".
- `StickyNotes.tsx` creator dialogs: "Sticky Note Baru", "Judul...", "Deskripsi...", "Warna", "Done", "Batal", AI placeholders, "Login dulu untuk lihat riwayat AI".
- `HelpGuide.tsx`: the entire `FAQ` array (12 questions + answers) → move to `T` as `faq_q1`/`faq_a1`…`faq_q12`/`faq_a12`; "Login dahulu" button → `login_first`.
- `MobileAIChat.tsx`: initial greeting, "sedang berpikir...", file-upload prompt, placeholder.
- `Index.tsx`: toast "Login dulu untuk lihat riwayat AI", copyright line stays as-is (proper noun/email).
- `SettingsModal.tsx`, `UserMenu.tsx`, `SocialBreakPanel.tsx`: scan and replace any remaining Indonesian literals.

Add an explicit `t()` audit checklist in PR description; render-test each language by switching from settings.

## 3. Floating-item selection + Hapus Semua

In `StickyNotes.tsx`:

- Add state `selectedId: string | null` and `armedId: string | null`.
- On `pointerdown` of a note, start a 2-second timer (`setTimeout`). If pointer is released without dragging more than ~5 px, mark `selectedId = id`. Cancel the timer if drag starts or pointer moves > 5 px (so dragging still works). This matches "ditekan akan aktif setelah dua detik".
- Click anywhere outside any note clears `selectedId`.
- In `NoteCard`, when `note.id === selectedId`, add classes `ring-2 ring-primary border-dashed outline-dashed outline-2 outline-primary` (Tailwind dashed border indicator).
- Render a floating "Hapus Semua" button:
  - When `notes.length > 0`, show fixed bottom-center button: trash icon on top, `t("delete_all")` label below (`fixed bottom-24 left-1/2 -translate-x-1/2`).
  - When a note is selected, anchor a small "Hapus" button just below the selected note (absolute, computed from `note.x/y/width/height`).
  - Click → confirm via `sonner` toast with action, then `setNotes([])` and clear `selectedId`.

New i18n keys: `delete_all`, `selected_hint`, `delete_one`.

## 4. PDF upload + conversion picker inside Talk-with-AI

Applies to both desktop `AiChatNote` (inside `StickyNotes.tsx`) and `MobileAIChat.tsx`. Backend already supports `action: "convert"` with formats pdf/docx/txt/md/html/rtf/json/csv/xml/epub via `supabase/functions/process-file/index.ts` — no edge-function changes needed.

UI changes (chat input area):
- Existing paperclip/Plus opens file picker (accept includes `.pdf`).
- When the chosen file is a PDF (`f.type === "application/pdf"` or `.pdf`):
  1. Don't auto-send yet. Stage it as `pendingFile`.
  2. Render a chip above the textarea: file name + a `<Select>` dropdown labelled `t("convert_to")` with options: Word (.docx), Text (.txt), Image (.jpg via existing PNG export fallback → add PNG/JPG entry), Markdown (.md), HTML.
  3. Send button caption changes to `t("convert_and_send")`.
- On send:
  - Call `supabase.functions.invoke("process-file", { body: { action: "extract", ... } })` to get text.
  - Then call `action: "convert"` with selected `format`.
  - Trigger download from returned `dataUrl`, and append an assistant message: `t("download_ready")` + filename.
- Non-PDF files keep the current "what do you want to do" prompt flow.

New i18n keys: `convert_and_send`, `pdf_detected`, `choose_target_format`, format labels `fmt_word`, `fmt_text`, `fmt_image`, `fmt_md`, `fmt_html`.

## Files touched

- New: `src/lib/socialPopup.ts`
- Edited: `src/components/StickyNotes.tsx`, `src/components/TimerSetup.tsx`, `src/components/MobileAIChat.tsx`, `src/components/HelpGuide.tsx`, `src/components/SettingsModal.tsx`, `src/components/UserMenu.tsx`, `src/components/SocialBreakPanel.tsx`, `src/pages/Index.tsx`, `src/lib/i18n.tsx`

## Verification

- Switch language to en / ar / ja / zh and scan timer card, break card, FAB menu, sticky/media/AI creators, HelpGuide, mobile chat, settings — confirm no Indonesian leaks.
- Click each social icon → popup window opens with `width=450,height=750`.
- Press-and-hold a sticky note 2 s → dashed outline appears; click "Hapus Semua" → all notes cleared.
- Upload a PDF in Talk-with-AI → format dropdown appears → send → file downloads in selected format.
