import { useState } from "react";
import { HelpCircle, Timer, Flower2, Rocket, Music, Settings, StickyNote, Repeat, Sparkles, Image as ImageIcon, Plus } from "lucide-react";
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
    icon: Music,
    q: "Bagaimana cara menambah musik & suara ambient?",
    a: "Buka Settings → masukkan link YouTube atau upload file musik. Suara ambient (rain, fire, dll) juga di Settings.",
  },
  {
    icon: Plus,
    q: "Apa isi tombol + di pojok kanan bawah?",
    a: "Klik untuk membuka 3 pilihan: Sticky Note, Media (gambar/video draggable), dan Talk with AI (chat dengan Bloomdoro AI).",
  },
  {
    icon: StickyNote,
    q: "Cara membuat sticky note?",
    a: "Klik + → Sticky Note. Isi judul/deskripsi (Enter untuk baris baru / list), pilih warna, lalu drag note ke posisi yang kamu mau.",
  },
  {
    icon: ImageIcon,
    q: "Apa itu Media note?",
    a: "Pilih + → Media untuk menempel gambar atau video di layar. Drag untuk pindah, tarik pojok kanan-bawah untuk memperbesar.",
  },
  {
    icon: Sparkles,
    q: "Apa itu Talk with AI? (NEW)",
    a: "Pilih + → Talk with AI. Pilih mode di atas chat: Talk biasa (singkat), Riset (analisis + link referensi), atau Coding (kode dengan syntax highlight). Riwayat chat tersimpan di tombol Riwayat AI di header.",
  },
  {
    icon: Settings,
    q: "Bagaimana mengganti background, suara video & efek kaca?",
    a: "Buka Settings → Background. Upload gambar/video, atur Overlay Opacity, atur Buram Kotak Waktu (Glass), dan aktifkan Suara Background bila video punya audio.",
  },
  {
    icon: Rocket,
    q: "Apa beda tema bunga & roket?",
    a: "Bunga tumbuh perlahan saat fokus berjalan. Roket menyalakan api lalu terbang ke bulan ketika sesi hampir selesai.",
  },
];

const EASTER_EGG = {
  icon: Sparkles,
  q: "Easter Egg",
  a: "Ada easter egg dalam sini...",
};

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

            {/* Easter egg teaser at the very bottom */}
            <div className="rounded-lg border border-border bg-card/50 p-3" style={{ opacity: 0.5 }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <EASTER_EGG.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground mb-1">{EASTER_EGG.q}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">{EASTER_EGG.a}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
