import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

const AMBIENT_SOUNDS = [
  { id: "rain", label: "🌧️ Rain", url: "https://cdn.freesound.org/previews/531/531947_6271029-lq.mp3" },
  { id: "fire", label: "🔥 Fire", url: "https://cdn.freesound.org/previews/277/277021_4548252-lq.mp3" },
  { id: "birds", label: "🐦 Birds", url: "https://cdn.freesound.org/previews/531/531015_6271029-lq.mp3" },
  { id: "waves", label: "🌊 Waves", url: "https://cdn.freesound.org/previews/467/467539_5765668-lq.mp3" },
];

export function AmbientSounds() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setActiveSound(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
      if (sound) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = 0.4;
        audio.play().catch(() => {});
        audioRef.current = audio;
        setActiveSound(soundId);
      }
    }
  };

  const stopAll = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setActiveSound(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
      >
        {activeSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        Ambient
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-xl shadow-lg p-3 flex flex-col gap-1.5 min-w-[150px] z-20">
          {AMBIENT_SOUNDS.map((sound) => (
            <button
              key={sound.id}
              onClick={() => toggleSound(sound.id)}
              className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                activeSound === sound.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {sound.label}
            </button>
          ))}
          {activeSound && (
            <button
              onClick={stopAll}
              className="px-3 py-2 rounded-lg text-sm text-left transition-colors text-destructive hover:bg-destructive/10"
            >
              🔇 Matikan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
