import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "id" | "en" | "ar" | "ja" | "zh";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "id", label: "Indonesian", native: "Indonesia" },
  { code: "en", label: "English", native: "English" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "zh", label: "Chinese", native: "中文" },
];

type Dict = Record<string, Record<Lang, string>>;

export const T: Dict = {
  // Header / general
  garden: { id: "Garden", en: "Garden", ar: "الحديقة", ja: "ガーデン", zh: "花园" },
  ai_history: { id: "Riwayat AI", en: "AI History", ar: "سجل الذكاء", ja: "AI履歴", zh: "AI 历史" },
  settings: { id: "Settings", en: "Settings", ar: "الإعدادات", ja: "設定", zh: "设置" },
  sessions_completed: { id: "Sesi Selesai", en: "Sessions Completed", ar: "جلسات مكتملة", ja: "完了したセッション", zh: "已完成会话" },
  open_garden: { id: "Buka Garden", en: "Open Garden", ar: "افتح الحديقة", ja: "ガーデンを開く", zh: "打开花园" },

  // Timer setup
  set_focus: { id: "Atur Waktu Fokus", en: "Set Your Focus Time", ar: "اضبط وقت التركيز", ja: "集中時間を設定", zh: "设置专注时间" },
  pick_theme: { id: "Pilih Tema Animasi", en: "Pick Animation Theme", ar: "اختر السمة", ja: "テーマを選択", zh: "选择主题" },
  flower_grow: { id: "Bunga Tumbuh", en: "Growing Flower", ar: "زهرة نامية", ja: "成長する花", zh: "成长的花" },
  rocket_moon: { id: "Roket ke Bulan", en: "Rocket to Moon", ar: "صاروخ إلى القمر", ja: "月へのロケット", zh: "飞向月球" },
  minutes: { id: "menit", en: "minutes", ar: "دقائق", ja: "分", zh: "分钟" },
  add_break: { id: "Tambahkan Waktu Istirahat", en: "Add Break Time", ar: "أضف وقت استراحة", ja: "休憩を追加", zh: "添加休息时间" },
  break_time: { id: "Break Time", en: "Break Time", ar: "وقت الاستراحة", ja: "休憩時間", zh: "休息时间" },
  repeat: { id: "Repeat", en: "Repeat", ar: "تكرار", ja: "リピート", zh: "重复" },
  on: { id: "ON", en: "ON", ar: "تشغيل", ja: "オン", zh: "开" },
  off: { id: "OFF", en: "OFF", ar: "إيقاف", ja: "オフ", zh: "关" },

  // Timer running
  focus_session: { id: "Sesi Fokus", en: "Focus Session", ar: "جلسة تركيز", ja: "集中セッション", zh: "专注会话" },
  resting: { id: "Waktu Istirahat", en: "Resting", ar: "وقت الراحة", ja: "休憩中", zh: "休息中" },
  click_play: { id: "Klik play untuk memulai sesi!", en: "Click play to start your session!", ar: "اضغط تشغيل للبدء!", ja: "再生をクリックして開始！", zh: "点击播放开始会话！" },
  back_setup: { id: "← Ganti waktu", en: "← Change time", ar: "← تغيير الوقت", ja: "← 時間を変更", zh: "← 更改时间" },
  stop: { id: "Hentikan", en: "Stop", ar: "إيقاف", ja: "停止", zh: "停止" },
  cycle_no: { id: "Putaran ke-", en: "Cycle #", ar: "دورة #", ja: "サイクル ", zh: "第 " },

  // Settings sections
  dark_mode: { id: "Dark Mode", en: "Dark Mode", ar: "الوضع الداكن", ja: "ダークモード", zh: "深色模式" },
  dark_active: { id: "Dark Mode Aktif", en: "Dark Mode Active", ar: "الوضع الداكن مفعل", ja: "ダークモード有効", zh: "深色模式已启用" },
  light_active: { id: "Light Mode Aktif", en: "Light Mode Active", ar: "الوضع الفاتح مفعل", ja: "ライトモード有効", zh: "浅色模式已启用" },
  language: { id: "Bahasa", en: "Language", ar: "اللغة", ja: "言語", zh: "语言" },
  ambient_sounds: { id: "Suara Ambient", en: "Ambient Sounds", ar: "أصوات محيطة", ja: "アンビエント音", zh: "环境声音" },
  turn_off: { id: "Matikan", en: "Turn Off", ar: "إيقاف", ja: "オフ", zh: "关闭" },
  volume: { id: "Volume", en: "Volume", ar: "الصوت", ja: "音量", zh: "音量" },
  background: { id: "Background", en: "Background", ar: "الخلفية", ja: "背景", zh: "背景" },
  upload_media: { id: "Upload gambar / video", en: "Upload image / video", ar: "رفع صورة / فيديو", ja: "画像/動画をアップロード", zh: "上传图片/视频" },
  paste_url_bg: { id: "Tempel URL gambar/video/YouTube...", en: "Paste image/video/YouTube URL...", ar: "الصق رابط...", ja: "URLを貼り付け...", zh: "粘贴URL..." },
  go: { id: "Go", en: "Go", ar: "ابدأ", ja: "実行", zh: "前往" },
  overlay_opacity: { id: "Opacity Overlay", en: "Overlay Opacity", ar: "شفافية الطبقة", ja: "オーバーレイ不透明度", zh: "覆盖层透明度" },
  glass_opacity: { id: "Buram Kotak Waktu (Glass)", en: "Timer Card Glass Blur", ar: "ضبابية الإطار", ja: "タイマーガラス効果", zh: "计时器玻璃模糊" },
  bg_sound_on: { id: "Suara Background ON", en: "Background Sound ON", ar: "صوت الخلفية مفعل", ja: "背景音声 オン", zh: "背景声音 开" },
  bg_sound_off: { id: "Suara Background OFF", en: "Background Sound OFF", ar: "صوت الخلفية مغلق", ja: "背景音声 オフ", zh: "背景声音 关" },
  remove_bg: { id: "Hapus Background", en: "Remove Background", ar: "إزالة الخلفية", ja: "背景を削除", zh: "移除背景" },
  upload_music: { id: "Upload Musik dari Perangkat", en: "Upload Music from Device", ar: "رفع موسيقى", ja: "デバイスから音楽", zh: "从设备上传音乐" },
  choose_audio: { id: "Pilih file audio", en: "Choose audio file", ar: "اختر ملف صوتي", ja: "音声ファイルを選択", zh: "选择音频文件" },
  youtube_link: { id: "Link YouTube", en: "YouTube Link", ar: "رابط يوتيوب", ja: "YouTubeリンク", zh: "YouTube 链接" },
  paste_youtube: { id: "Tempel URL YouTube...", en: "Paste YouTube URL...", ar: "الصق رابط يوتيوب...", ja: "YouTube URLを貼り付け...", zh: "粘贴 YouTube URL..." },

  // FAB / sticky notes / AI
  sticky_note: { id: "Sticky Note", en: "Sticky Note", ar: "ملاحظة لاصقة", ja: "付箋", zh: "便签" },
  media: { id: "Media", en: "Media", ar: "وسائط", ja: "メディア", zh: "媒体" },
  talk_with_ai: { id: "Talk with AI", en: "Talk with AI", ar: "تحدث مع الذكاء", ja: "AIと話す", zh: "与AI对话" },
  new_badge: { id: "BARU", en: "NEW", ar: "جديد", ja: "新着", zh: "新" },
  bloomdoro_ai: { id: "Bloomdoro AI", en: "Bloomdoro AI", ar: "Bloomdoro AI", ja: "Bloomdoro AI", zh: "Bloomdoro AI" },
  type_message: { id: "Tulis pesan...", en: "Type a message...", ar: "اكتب رسالة...", ja: "メッセージを入力...", zh: "输入消息..." },
  type_research: { id: "Topik yang ingin diriset...", en: "Topic to research...", ar: "موضوع البحث...", ja: "調査するトピック...", zh: "要研究的主题..." },
  type_code: { id: "Tanya tentang kode...", en: "Ask about code...", ar: "اسأل عن الكود...", ja: "コードについて...", zh: "询问代码..." },
  ai_greet: {
    id: "Halo! Aku **Bloomdoro AI** — teman ngobrolmu di sela-sela fokus. Lagi ngerjain apa hari ini?",
    en: "Hi! I'm **Bloomdoro AI** — your chat companion between focus sessions. What are you working on today?",
    ar: "مرحبا! أنا **Bloomdoro AI** — رفيقك أثناء فترات التركيز. ماذا تعمل اليوم؟",
    ja: "こんにちは！**Bloomdoro AI** です。今日は何をしていますか？",
    zh: "你好！我是 **Bloomdoro AI** — 你的专注小伙伴。今天在做什么？",
  },
  references: { id: "Referensi", en: "References", ar: "مراجع", ja: "参考", zh: "参考" },
  copy: { id: "Salin", en: "Copy", ar: "نسخ", ja: "コピー", zh: "复制" },
  copied: { id: "Tersalin", en: "Copied", ar: "تم النسخ", ja: "コピー済", zh: "已复制" },
  language_label: { id: "Bahasa", en: "Language", ar: "اللغة", ja: "言語", zh: "语言" },

  // Chat history
  ai_history_title: { id: "Riwayat Talk with AI", en: "AI Talk History", ar: "سجل المحادثة", ja: "AIチャット履歴", zh: "AI 对话历史" },
  no_history: { id: "Belum ada percakapan tersimpan.", en: "No saved conversations yet.", ar: "لا توجد محادثات.", ja: "保存された会話はまだありません。", zh: "还没有保存的对话。" },
  pick_chat: { id: "Pilih percakapan untuk dibaca.", en: "Pick a conversation to read.", ar: "اختر محادثة للقراءة.", ja: "読む会話を選択。", zh: "选择对话查看。" },
  continue_chat: { id: "Lanjutkan mengobrol", en: "Continue chatting", ar: "تابع المحادثة", ja: "チャットを続ける", zh: "继续聊天" },

  // Help guide
  guide_title: { id: "Panduan Bloomdoro", en: "Bloomdoro Guide", ar: "دليل Bloomdoro", ja: "Bloomdoroガイド", zh: "Bloomdoro 指南" },
  guide_subtitle: { id: "Pertanyaan umum & panduan singkat menggunakan aplikasi.", en: "Common questions & a short app guide.", ar: "أسئلة شائعة ودليل قصير.", ja: "よくある質問と簡単なガイド。", zh: "常见问题和简短指南。" },
  contact_suggest: {
    id: "Hubungi jika ada saran: attayaarkarna12@gmail.com",
    en: "Contact for suggestions: attayaarkarna12@gmail.com",
    ar: "للتواصل بالاقتراحات: attayaarkarna12@gmail.com",
    ja: "ご意見はこちら: attayaarkarna12@gmail.com",
    zh: "建议请联系：attayaarkarna12@gmail.com",
  },
  easter_hint: {
    id: "easter egg dalam sini...",
    en: "easter egg in here...",
    ar: "بيضة عيد الفصح هنا...",
    ja: "イースターエッグがここに…",
    zh: "彩蛋藏在这里…",
  },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof T) => string;
}

const Ctx = createContext<LangCtx | null>(null);
const STORAGE_KEY = "bloomdoro_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) as Lang | null;
    return saved || "id";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key: keyof typeof T) => T[key]?.[lang] ?? T[key]?.id ?? String(key);

  return <Ctx.Provider value={{ lang, setLang: setLangState, t }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be inside LanguageProvider");
  return v;
}
