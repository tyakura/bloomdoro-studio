import { useState, useRef, useEffect } from "react";
import { Music, X, Pause, Play } from "lucide-react";

interface MusicPlayerProps {
  url: string | null;
  name: string | null;
  onClear: () => void;
  stopRef?: React.MutableRefObject<(() => void) | null>;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function MusicPlayer({ url, name, onClear, stopRef }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const ytId = url ? getYouTubeId(url) : null;

  useEffect(() => {
    if (!url) return;
    if (ytId) {
      // YouTube handled via iframe; mark playing
      setIsPlaying(true);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
    if (stopRef) {
      stopRef.current = () => {
        audioRef.current?.pause();
        postYT("pauseVideo");
        setIsPlaying(false);
      };
    }
    return () => {
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const postYT = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*"
    );
  };

  const togglePlayback = () => {
    if (ytId) {
      if (isPlaying) postYT("pauseVideo"); else postYT("playVideo");
      setIsPlaying(!isPlaying);
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  if (!url) return null;

  return (
    <>
      {ytId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&enablejsapi=1`}
          allow="autoplay; encrypted-media"
          className="fixed -left-[9999px] w-1 h-1 pointer-events-none"
          title="YouTube audio"
        />
      )}
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm">
        <Music className="w-4 h-4 text-primary" />
        <span className="truncate max-w-[120px]">{name}</span>
        <button onClick={togglePlayback} className="hover:text-primary transition-colors">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => { audioRef.current?.pause(); postYT("pauseVideo"); onClear(); setIsPlaying(false); }} className="hover:text-destructive transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
