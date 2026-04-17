import { useEffect, useRef } from "react";
import { RotateCcw, ArrowLeft, PartyPopper, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletionScreenProps {
  lastMinutes: number;
  onReuse: () => void;
  onChangeTime: () => void;
  cycleCount?: number;
}

export function CompletionScreen({ lastMinutes, onReuse, onChangeTime, cycleCount = 0 }: CompletionScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("https://cdn.freesound.org/previews/536/536420_11943129-lq.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-card border border-border shadow-sm max-w-md w-full animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-badge-bg flex items-center justify-center">
        <PartyPopper className="w-10 h-10 text-badge-text" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Sesi Selesai!
        </h2>
        <p className="text-muted-foreground text-sm">
          Kamu telah menyelesaikan sesi fokus {lastMinutes} menit. Kerja bagus!
        </p>
        {cycleCount > 1 && (
          <p className="text-primary text-sm font-medium inline-flex items-center gap-1.5 justify-center">
            <Flower2 className="w-4 h-4" />
            {cycleCount} putaran selesai — {cycleCount} bunga ditambahkan ke garden!
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full mt-2">
        <Button
          onClick={onReuse}
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Gunakan {lastMinutes} menit lagi
        </Button>
        <Button
          onClick={onChangeTime}
          variant="outline"
          className="w-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Ganti waktu
        </Button>
      </div>
    </div>
  );
}
