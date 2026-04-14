import { useState, useRef } from "react";
import { Settings, X, Upload, Link, Flower2, Image, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const AMBIENT_SOUNDS = [
  { id: "rain", label: "🌧️ Rain", url: "https://cdn.freesound.org/previews/531/531947_6271029-lq.mp3" },
  { id: "fire", label: "🔥 Fire", url: "https://cdn.freesound.org/previews/277/277021_4548252-lq.mp3" },
  { id: "birds", label: "🐦 Birds", url: "https://cdn.freesound.org/previews/531/531015_6271029-lq.mp3" },
  { id: "waves", label: "🌊 Waves", url: "https://cdn.freesound.org/previews/467/467539_5765668-lq.mp3" },
];

interface SettingsModalProps {
  onMusicLoad: (url: string, name: string) => void;
  showAmbient?: boolean;
  showGarden?: boolean;
  onGardenOpen?: () => void;
  onBgChange?: (url: string | null, isVideo: boolean) => void;
  bgImage?: string | null;
  overlayOpacity?: number;
  onOverlayChange?: (val: number) => void;
}

export function SettingsModal({ onMusicLoad, showAmbient = false, showGarden = false, onGardenOpen, onBgChange, bgImage, overlayOpacity = 70, onOverlayChange }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [bgUrl, setBgUrl] = useState("");
  const [volume, setVolume] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onMusicLoad(url, file.name);
    }
  };

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");
      onBgChange?.(url, isVideo);
    }
  };

  const handleBgUrlSubmit = () => {
    if (bgUrl.trim()) {
      const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(bgUrl);
      onBgChange?.(bgUrl.trim(), isVideo);
      setBgUrl("");
    }
  };

  const handleYoutubeSubmit = () => {
    if (youtubeUrl.trim()) {
      onMusicLoad(youtubeUrl, "YouTube Audio");
      setYoutubeUrl("");
    }
  };

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
        audio.volume = volume / 100;
        audio.play().catch(() => {});
        audioRef.current = audio;
        setActiveSound(soundId);
      }
    }
  };

  const stopAmbient = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setActiveSound(null);
  };

  const handleVolumeChange = (val: number[]) => {
    setVolume(val[0]);
    if (audioRef.current) {
      audioRef.current.volume = val[0] / 100;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Settings</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-foreground">Settings</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Garden button for mobile */}
          {showGarden && onGardenOpen && (
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Garden</h3>
              <Button
                onClick={() => { onGardenOpen(); setIsOpen(false); }}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Flower2 className="w-4 h-4" />
                Open Garden
              </Button>
            </div>
          )}

          {/* Ambient sounds for mobile */}
          {showAmbient && (
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Ambient Sounds</h3>
              <div className="grid grid-cols-2 gap-2">
                {AMBIENT_SOUNDS.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => toggleSound(sound.id)}
                    className={`px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                      activeSound === sound.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-muted text-foreground"
                    }`}
                  >
                    {sound.label}
                  </button>
                ))}
              </div>
              {activeSound && (
                <button
                  onClick={stopAmbient}
                  className="mt-2 w-full px-3 py-2 rounded-lg text-sm text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                >
                  🔇 Matikan
                </button>
              )}
            </div>
          )}

          {/* Volume Control */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Volume
            </h3>
            <div className="flex items-center gap-3">
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">{volume}%</span>
            </div>
          </div>

          {/* Background Image/Video */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Background
            </h3>
            <div className="space-y-2">
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleBgFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => bgFileInputRef.current?.click()}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload gambar / video
              </Button>
              <div className="flex gap-2">
                <Input
                  value={bgUrl}
                  onChange={(e) => setBgUrl(e.target.value)}
                  placeholder="Paste image/video URL..."
                  className="flex-1"
                />
                <Button onClick={handleBgUrlSubmit} size="icon" variant="outline">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
              {bgImage && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Overlay Opacity: {overlayOpacity}%</label>
                    <Slider
                      value={[overlayOpacity]}
                      onValueChange={(val) => onOverlayChange?.(val[0])}
                      max={100}
                      min={0}
                      step={5}
                    />
                  </div>
                  <Button
                    onClick={() => onBgChange?.(null, false)}
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                  >
                    Hapus Background
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Upload Music from Device</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose audio file
            </Button>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">YouTube Link</h3>
            <div className="flex gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube URL..."
                className="flex-1"
              />
              <Button onClick={handleYoutubeSubmit} size="icon" variant="outline">
                <Link className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: YouTube playback requires the URL to be a direct audio link or embed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
