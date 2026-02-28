import { useState, useRef, useEffect } from "react";
import { Music, X, Pause, Play } from "lucide-react";

interface MusicPlayerProps {
  url: string | null;
  name: string | null;
  onClear: () => void;
}

export function MusicPlayer({ url, name, onClear }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (url) {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    return () => {
      audioRef.current?.pause();
    };
  }, [url]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  if (!url) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm">
      <Music className="w-4 h-4 text-primary" />
      <span className="truncate max-w-[120px]">{name}</span>
      <button onClick={togglePlayback} className="hover:text-primary transition-colors">
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => { audioRef.current?.pause(); onClear(); setIsPlaying(false); }} className="hover:text-destructive transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
