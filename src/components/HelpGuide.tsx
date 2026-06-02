import { useState } from "react";
import { HelpCircle, Timer, Flower2, Rocket, Music, Settings, StickyNote, Repeat, Sparkles, Image as ImageIcon, Plus, Languages, Lock, LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const FAQ: { icon: any; q: string; a: string; requiresLogin?: boolean }[] = [
  { icon: Timer, q: "Bagaimana cara memulai sesi fokus?", a: "Atur durasi fokus & istirahat, pilih tema (bunga/roket), lalu klik play." },
  { icon: Repeat, q: "Apa fungsi mode Repeat?", a: "Mengulang sesi fokus & istirahat otomatis sampai kamu klik Hentikan." },
  { icon: Flower2, q: "Bagaimana cara mengisi Garden?", a: "Setiap sesi fokus selesai dengan tema bunga, satu bunga ditambahkan (maks 20)." },
  { icon: Languages, q: "Bagaimana ganti bahasa?", a: "Profil → Settings → Bahasa: Indonesia, English, Arab, Jepang, China. Semua teks UI & sapaan AI ikut berubah." },
  { icon: Music, q: "Cara menambah musik & ambient?", a: "Profil → Settings → Upload musik atau tempel link YouTube (klik Go). Ambient sound juga di Settings.", requiresLogin: true },
  { icon: Plus, q: "Apa isi tombol + di pojok kanan bawah?", a: "Sticky Note, Media (gambar/video draggable), dan Talk with AI." },
  { icon: StickyNote, q: "Cara membuat sticky note?", a: "+ → Sticky Note. Isi judul/deskripsi, pilih warna, drag ke posisinya." },
  { icon: ImageIcon, q: "Apa itu Media note?", a: "+ → Media. Tempel YouTube/file/URL. Drag header untuk pindah, pojok kanan-bawah untuk resize." },
  { icon: Sparkles, q: "Apa itu Talk with AI?", a: "Pilih mode Talk (singkat), Riset (analisis + link referensi), atau Coding (kode + tombol salin). Shift+Enter untuk baris baru, Enter untuk kirim. Riwayat di Profil → Riwayat AI — kamu bisa Lanjutkan mengobrol.", requiresLogin: true },
  { icon: Settings, q: "Background gambar/video & efek kaca?", a: "Profil → Settings → Background. Upload atau tempel URL (gambar/video/YouTube), klik Go. Atur Overlay, Glass, dan suara background.", requiresLogin: true },
  { icon: Rocket, q: "Beda tema bunga & roket?", a: "Bunga tumbuh perlahan; roket menyalakan api lalu terbang ke bulan dan berhenti di sana." },
  { icon: Sparkles, q: "Data saya hilang kalau refresh?", a: "Tidak. Sticky note, media, background gambar, garden, bahasa & sesi tersimpan otomatis (hingga 10 MB di browser). Dengan login, data juga sinkron lintas perangkat.", requiresLogin: true },
];

export function HelpGuide() {
  const { t } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Help"
        className="fixed bottom-6 left-6 z-50 w-7 h-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              {t("guide_title")}
            </DialogTitle>
            <DialogDescription>{t("guide_subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-1">
            <h3 className="font-display font-bold text-sm text-foreground mb-1.5">
              {t("guide_intro_title")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("guide_intro_body")}
            </p>
          </div>

          <div className="space-y-3 mt-2">
            {FAQ.map(({ icon: Icon, q, a, requiresLogin }, i) => {
              const locked = requiresLogin && !user;
              return (
                <div key={i} className={`relative rounded-lg border border-border bg-card/50 p-3 transition-colors ${locked ? "opacity-70" : "hover:bg-card"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1.5">
                        {q}
                        {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                      {locked && (
                        <Link
                          to="/auth"
                          onClick={() => setOpen(false)}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90"
                        >
                          <LogIn className="w-3 h-3" /> Login dahulu
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Contact + easter egg hint at the bottom — no box, no icon, thin text */}
            <div className="pt-4 mt-2 space-y-1.5 text-center">
              <p className="text-[11px] text-muted-foreground">{t("contact_suggest")}</p>
              <p className="text-[11px] italic text-muted-foreground" style={{ opacity: 0.3 }}>
                {t("easter_hint")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
