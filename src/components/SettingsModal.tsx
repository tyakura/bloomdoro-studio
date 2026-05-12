import { useState, useRef, useEffect } from "react";
import { Settings, X, Upload, Flower2, Image, Volume2, Moon, Sun, CloudRain, Flame, Bird, Waves, VolumeOff, Languages, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useLang, LANGUAGES, Lang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const AMBIENT_SOUNDS = [
  { id: "rain", label: "Rain", icon: CloudRain, url: "https://cdn.freesound.org/previews/531/531947_6271029-lq.mp3" },
  { id: "fire", label: "Fire", icon: Flame, url: "https://cdn.freesound.org/previews/277/277021_4548252-lq.mp3" },
  { id: "birds", label: "Birds", icon: Bird, url: "https://cdn.freesound.org/previews/531/531015_6271029-lq.mp3" },
  { id: "waves", label: "Waves", icon: Waves, url: "https://cdn.freesound.org/previews/467/467539_5765668-lq.mp3" },
];

export type BgKind = "image" | "video" | "youtube";

interface SettingsModalProps {
  onMusicLoad: (url: string, name: string) => void;
  showGarden?: boolean;
  onGardenOpen?: () => void;
  onBgChange?: (url: string | null, kind: BgKind) => void;
  bgImage?: string | null;
  bgKind?: BgKind;
  overlayOpacity?: number;
  onOverlayChange?: (val: number) => void;
  glassOpacity?: number;
  onGlassChange?: (val: number) => void;
  bgVideoMuted?: boolean;
  onBgVideoMutedChange?: (v: boolean) => void;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function DarkModeToggle() {
  const { t } = useLang();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
  }, []);

  return (
    <div>
      <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        {t("dark_mode")}
      </h3>
      <button
        onClick={() => setIsDark(!isDark)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
          isDark ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        <span className="text-sm font-medium">{isDark ? t("dark_active") : t("light_active")}</span>
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function SettingsModal({ onMusicLoad, showGarden = false, onGardenOpen, onBgChange, bgImage, bgKind = "image", overlayOpacity = 70, onOverlayChange, glassOpacity = 40, onGlassChange, bgVideoMuted = true, onBgVideoMutedChange }: SettingsModalProps) {
  const { t, lang, setLang } = useLang();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [bgUrl, setBgUrl] = useState("");
  const [volume, setVolume] = useState(() => parseInt(localStorage.getItem("bloomdoro_volume") || "50"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { localStorage.setItem("bloomdoro_volume", String(volume)); }, [volume]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onMusicLoad(URL.createObjectURL(file), file.name);
  };

  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    if (isVideo) {
      // videos: use blob URL (too large to base64); user accepts that videos may not persist
      onBgChange?.(URL.createObjectURL(file), "video");
    } else {
      // images: convert to data URL so it persists
      const { toDataURL } = await import("@/lib/persist");
      const data = await toDataURL(file);
      onBgChange?.(data, "image");
    }
  };

  const handleBgUrlSubmit = () => {
    const u = bgUrl.trim();
    if (!u) return;
    const ytId = getYouTubeId(u);
    if (ytId) onBgChange?.(ytId, "youtube");
    else if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u)) onBgChange?.(u, "video");
    else onBgChange?.(u, "image");
    setBgUrl("");
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
    if (audioRef.current) audioRef.current.volume = val[0] / 100;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">{t("settings")}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-foreground">{t("settings")}</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <DarkModeToggle />

          {/* Language */}
          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              {t("language")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(({ code, native }) => (
                <button
                  key={code}
                  onClick={() => setLang(code as Lang)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    lang === code ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {native}
                </button>
              ))}
            </div>
          </div>

          {showGarden && onGardenOpen && (
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">{t("garden")}</h3>
              <Button
                onClick={() => { onGardenOpen(); setIsOpen(false); }}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Flower2 className="w-4 h-4" />
                {t("open_garden")}
              </Button>
            </div>
          )}

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">{t("ambient_sounds")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {AMBIENT_SOUNDS.map((sound) => {
                const Icon = sound.icon;
                return (
                  <button
                    key={sound.id}
                    onClick={() => toggleSound(sound.id)}
                    className={`px-3 py-2.5 rounded-lg text-sm text-left transition-colors flex items-center gap-2 ${
                      activeSound === sound.id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {sound.label}
                  </button>
                );
              })}
            </div>
            {activeSound && (
              <button
                onClick={stopAmbient}
                className="mt-2 w-full px-3 py-2 rounded-lg text-sm text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
              >
                <VolumeOff className="w-4 h-4" />
                {t("turn_off")}
              </button>
            )}
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              {t("volume")}
            </h3>
            <div className="flex items-center gap-3">
              <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} min={0} step={1} className="flex-1" />
              <span className="text-sm text-muted-foreground w-10 text-right">{volume}%</span>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              {t("background")}
            </h3>
            <div className="space-y-2">
              <input ref={bgFileInputRef} type="file" accept="image/*,video/*" onChange={handleBgFileUpload} className="hidden" />
              <Button onClick={() => bgFileInputRef.current?.click()} variant="outline" className="w-full justify-start gap-2">
                <Upload className="w-4 h-4" />
                {t("upload_media")}
              </Button>
              <div className="flex gap-2">
                <Input value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder={t("paste_url_bg")} className="flex-1" />
                <Button onClick={handleBgUrlSubmit} variant="outline" className="px-4">{t("go")}</Button>
              </div>
              {bgImage && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">{t("overlay_opacity")}: {overlayOpacity}%</label>
                    <Slider value={[overlayOpacity]} onValueChange={(val) => onOverlayChange?.(val[0])} max={100} min={0} step={5} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">{t("glass_opacity")}: {glassOpacity}%</label>
                    <Slider value={[glassOpacity]} onValueChange={(val) => onGlassChange?.(val[0])} max={100} min={0} step={5} />
                  </div>
                  {(bgKind === "video" || bgKind === "youtube") && (
                    <button
                      onClick={() => onBgVideoMutedChange?.(!bgVideoMuted)}
                      className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
                        bgVideoMuted ? "bg-secondary text-secondary-foreground hover:bg-muted" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {bgVideoMuted ? <VolumeOff className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      {bgVideoMuted ? t("bg_sound_off") : t("bg_sound_on")}
                    </button>
                  )}
                  <Button onClick={() => onBgChange?.(null, "image")} variant="outline" className="w-full text-destructive hover:text-destructive">
                    {t("remove_bg")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">{t("upload_music")}</h3>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full justify-start gap-2">
              <Upload className="w-4 h-4" />
              {t("choose_audio")}
            </Button>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">{t("youtube_link")}</h3>
            <div className="flex gap-2">
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder={t("paste_youtube")} className="flex-1" />
              <Button onClick={handleYoutubeSubmit} variant="outline" className="px-4">{t("go")}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
