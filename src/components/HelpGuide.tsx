import { useState } from "react";
import { HelpCircle, Timer, Flower2, Rocket, Music, Settings, StickyNote, Repeat, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const FAQ = [
  {
    icon: Timer,
    q: "Bagaimana cara memulai sesi fokus?",
    a: "Atur durasi fokus dan istirahat di halaman setup, pilih tema (bunga/roket), lalu klik tombol play untuk memulai.",
  },
  {
    icon: Repeat,
    q: "Apa fungsi mode Repeat?",
    a: "Mode repeat akan otomatis mengulang sesi fokus dan istirahat secara terus-menerus sampai kamu menekan tombol Hentikan.",
  },
  {
    icon: Flower2,
    q: "Bagaimana cara mengisi Garden?",
    a: "Setiap kali kamu menyelesaikan satu sesi fokus dengan tema bunga, satu bunga akan ditambahkan ke Garden (maks 20 bunga).",
  },
  {
    icon: Sparkles,
    q: "Apa itu Easter Egg?",
    a: "Jalankan mode Repeat selama 5 menit — background akan berubah menjadi akar berbunga (tema bunga) atau luar angkasa (tema roket) selama 3 menit.",
  },
  {
    icon: Music,
    q: "Bagaimana cara menambah musik?",
    a: "Buka Settings, lalu masukkan link YouTube atau upload file musik lokal kamu untuk diputar selama sesi.",
  },
  {
    icon: StickyNote,
    q: "Cara membuat sticky note?",
    a: "Klik tombol + di pojok kanan bawah, isi judul/deskripsi, pilih warna, lalu drag note ke posisi yang kamu mau.",
  },
  {
    icon: Settings,
    q: "Bagaimana mengganti background?",
    a: "Buka Settings → Background, upload gambar atau video, lalu atur opacity overlay sesuai selera.",
  },
  {
    icon: Rocket,
    q: "Apa beda tema bunga & roket?",
    a: "Bunga tumbuh perlahan saat fokus berjalan. Roket menyalakan api lalu terbang ke bulan ketika sesi hampir selesai.",
  },
];

export function HelpGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Bantuan & Panduan"
        className="fixed bottom-6 left-6 z-50 w-7 h-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Panduan Bloomdoro
            </DialogTitle>
            <DialogDescription>
              Pertanyaan umum & panduan singkat menggunakan aplikasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {FAQ.map(({ icon: Icon, q, a }, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card/50 p-3 hover:bg-card transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">{q}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
