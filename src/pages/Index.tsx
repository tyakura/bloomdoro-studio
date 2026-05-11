import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Trophy, Flower2, Coffee, Square, MousePointerClick, History } from "lucide-react";
import { BloomdoroLogo } from "@/components/BloomdoroLogo";
import { TimerRing } from "@/components/TimerRing";
import { TimerSetup, TimerTheme } from "@/components/TimerSetup";
import { SettingsModal, BgKind } from "@/components/SettingsModal";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useTimer } from "@/hooks/useTimer";
import { GrowingFlower, FlowerVariant } from "@/components/GrowingFlower";
import { GrowingRocket } from "@/components/GrowingRocket";
import { CompletionScreen } from "@/components/CompletionScreen";
import { Garden } from "@/components/Garden";
import { StickyNotes } from "@/components/StickyNotes";
import { HelpGuide } from "@/components/HelpGuide";
import { EasterEggBackground } from "@/components/EasterEggBackground";
import { ChatHistory } from "@/components/ChatHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLang } from "@/lib/i18n";
import { loadJSON, saveJSON } from "@/lib/persist";

type SessionPhase = "setup" | "focus" | "break" | "complete";

interface BgState { url: string | null; kind: BgKind; overlay: number; glass: number; muted: boolean; }

const BG_KEY = "bloomdoro_bg";

const Index = () => {
  const { t } = useLang();
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [sessions, setSessions] = useState(() => loadJSON("bloomdoro_sessions", 0));
  const [customMinutes, setCustomMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [repeatMode, setRepeatMode] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [theme, setTheme] = useState<TimerTheme>("flower");
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string | null>(null);
  const [gardenOpen, setGardenOpen] = useState(false);
  const [gardenFlowers, setGardenFlowers] = useState<FlowerVariant[]>(() => loadJSON("bloomdoro_garden", [] as FlowerVariant[]));
  const [currentFlowerVariant, setCurrentFlowerVariant] = useState<FlowerVariant>(0);
  const [bg, setBg] = useState<BgState>(() => loadJSON<BgState>(BG_KEY, { url: null, kind: "image", overlay: 70, glass: 40, muted: true }));
  const [historyOpen, setHistoryOpen] = useState(false);
  const musicStopRef = useRef<(() => void) | null>(null);
  const isMobile = useIsMobile();
  const timer = useTimer(customMinutes);

  // Persistence
  useEffect(() => { saveJSON(BG_KEY, bg); }, [bg]);
  useEffect(() => { saveJSON("bloomdoro_garden", gardenFlowers); }, [gardenFlowers]);
  useEffect(() => { saveJSON("bloomdoro_sessions", sessions); }, [sessions]);

  // Track elapsed for easter egg
  const [repeatElapsed, setRepeatElapsed] = useState(0);
  useEffect(() => {
    if (!repeatMode || phase !== "focus" || timer.status !== "running") return;
    const id = setInterval(() => setRepeatElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [repeatMode, phase, timer.status]);

  const handleStart = useCallback((minutes: number, selectedTheme: TimerTheme, breakMins: number, repeat: boolean) => {
    setCustomMinutes(minutes);
    setBreakMinutes(breakMins);
    setRepeatMode(repeat);
    setCycleCount(0);
    setRepeatElapsed(0);
    setTheme(selectedTheme);
    setCurrentFlowerVariant((Math.floor(Math.random() * 4)) as FlowerVariant);
    timer.reset(minutes);
    setPhase("focus");
    setTimeout(() => timer.start(), 50);
  }, [timer]);

  const handleReset = useCallback(() => {
    if (phase === "focus") timer.reset(customMinutes);
    else if (phase === "break") timer.reset(breakMinutes);
  }, [timer, customMinutes, breakMinutes, phase]);

  const handleBackToSetup = useCallback(() => {
    timer.reset(customMinutes);
    setPhase("setup");
  }, [timer, customMinutes]);

  const handleStop = useCallback(() => {
    timer.reset(customMinutes);
    if (cycleCount > 0 && theme === "flower") {
      const newFlowers: FlowerVariant[] = [];
      for (let i = 0; i < cycleCount; i++) newFlowers.push((Math.floor(Math.random() * 4)) as FlowerVariant);
      setGardenFlowers((prev) => [...prev, ...newFlowers].slice(0, 20));
    }
    setPhase("complete");
  }, [timer, customMinutes, cycleCount, theme]);

  const handleReuse = useCallback(() => {
    setCurrentFlowerVariant((Math.floor(Math.random() * 4)) as FlowerVariant);
    setCycleCount(0);
    setRepeatElapsed(0);
    timer.reset(customMinutes);
    setPhase("focus");
    setTimeout(() => timer.start(), 50);
  }, [timer, customMinutes]);

  if (timer.status === "complete" && (phase === "focus" || phase === "break")) {
    musicStopRef.current?.();
    if (phase === "focus") {
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);
      setSessions((s) => s + 1);
      if (theme === "flower") setGardenFlowers((prev) => [...prev.slice(0, 19), currentFlowerVariant]);
      if (breakMinutes > 0) {
        timer.reset(breakMinutes);
        setPhase("break");
        setTimeout(() => timer.start(), 50);
      } else if (repeatMode) {
        setCurrentFlowerVariant((Math.floor(Math.random() * 4)) as FlowerVariant);
        timer.reset(customMinutes);
        setPhase("focus");
        setTimeout(() => timer.start(), 50);
      } else {
        setPhase("complete");
      }
    } else if (phase === "break") {
      if (repeatMode) {
        setCurrentFlowerVariant((Math.floor(Math.random() * 4)) as FlowerVariant);
        timer.reset(customMinutes);
        setPhase("focus");
        setTimeout(() => timer.start(), 50);
      } else {
        setPhase("complete");
      }
    }
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background */}
      {bg.url && bg.kind === "video" && (
        <video
          key={bg.url + (bg.muted ? "m" : "u")}
          src={bg.url}
          autoPlay loop muted={bg.muted} playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
        />
      )}
      {bg.url && bg.kind === "image" && (
        <div className="fixed inset-0 w-full h-full bg-cover bg-center z-0" style={{ backgroundImage: `url(${bg.url})` }} />
      )}
      {bg.url && bg.kind === "youtube" && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${bg.url}?autoplay=1&loop=1&playlist=${bg.url}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&mute=${bg.muted ? 1 : 0}&playsinline=1`}
            allow="autoplay; encrypted-media"
            title="YouTube background"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: "max(100vw, 177.78vh)", height: "max(56.25vw, 100vh)", border: 0 }}
          />
        </div>
      )}
      {bg.url && <div className="fixed inset-0 z-0" style={{ backgroundColor: `hsl(var(--background) / ${bg.overlay / 100})` }} />}

      <EasterEggBackground elapsedSeconds={repeatElapsed} active={repeatMode && phase === "focus"} theme={theme} />

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-5xl w-full mx-auto relative z-[120]">
        <BloomdoroLogo />
        <div className="flex items-center gap-2 sm:gap-3">
          <MusicPlayer url={musicUrl} name={musicName} onClear={() => { setMusicUrl(null); setMusicName(null); }} stopRef={musicStopRef} />
          {!isMobile && (
            <>
              <button
                onClick={() => setGardenOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                <Flower2 className="w-4 h-4" />
                {t("garden")}
              </button>
              <button
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                <History className="w-4 h-4" />
                {t("ai_history")}
              </button>
            </>
          )}
          <SettingsModal
            onMusicLoad={(url, name) => { setMusicUrl(url); setMusicName(name); }}
            showGarden={isMobile}
            onGardenOpen={() => setGardenOpen(true)}
            onBgChange={(url, kind) => setBg(b => ({ ...b, url, kind }))}
            bgImage={bg.url}
            bgKind={bg.kind}
            overlayOpacity={bg.overlay}
            onOverlayChange={(v) => setBg(b => ({ ...b, overlay: v }))}
            glassOpacity={bg.glass}
            onGlassChange={(v) => setBg(b => ({ ...b, glass: v }))}
            bgVideoMuted={bg.muted}
            onBgVideoMutedChange={(v) => setBg(b => ({ ...b, muted: v }))}
          />
        </div>
      </header>

      {/* Session Counter */}
      <div className="flex justify-center mt-4 relative z-10">
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border shadow-sm">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold text-foreground">
            {sessions} {t("sessions_completed")}
          </span>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-6 pb-12 relative z-10">
        {phase === "setup" ? (
          <div className="flex flex-col items-center gap-5">
            <TimerSetup onStart={handleStart} defaultTheme={theme} glassActive={!!bg.url} glassOpacity={bg.glass} />
            <p className="text-center text-xs text-muted-foreground/80">
              copyright©all rights reserved by attayaarkarna12@gmail.com
            </p>
          </div>
        ) : phase === "complete" ? (
          <CompletionScreen lastMinutes={customMinutes} onReuse={handleReuse} onChangeTime={() => setPhase("setup")} cycleCount={cycleCount} />
        ) : (
          <div className="flex flex-col items-center gap-5">
          <div className={`flex ${isMobile ? 'flex-col items-center gap-8' : 'flex-row items-center justify-center'}`} style={!isMobile ? { gap: '120px' } : undefined}>
            {isMobile && (
              <div className="flex-shrink-0 my-6">
                {phase === "focus" && (
                  theme === "flower" ? <GrowingFlower progress={timer.progress} variant={currentFlowerVariant} /> : <GrowingRocket progress={timer.progress} />
                )}
                {phase === "break" && (
                  <div className="flex flex-col items-center">
                    <Coffee className="w-16 h-16 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground mt-2">{t("resting")}</span>
                  </div>
                )}
              </div>
            )}

            <div
              className={`flex flex-col items-center gap-6 sm:gap-8 p-8 sm:p-10 rounded-2xl border shadow-sm min-w-[320px] sm:min-w-[420px] ${bg.url ? 'border-white/30' : 'bg-card border-border'}`}
              style={bg.url ? { backgroundColor: `hsl(var(--card) / ${bg.glass / 100})`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } : undefined}
            >
              <span className={`px-4 py-1.5 rounded-full font-display font-semibold text-sm tracking-wide uppercase ${
                phase === "break" ? "bg-accent/20 text-accent" : "bg-badge-bg text-badge-text"
              }`}>
                {phase === "focus" ? t("focus_session") : (
                  <span className="inline-flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5" />
                    {t("break_time")}
                  </span>
                )}
              </span>

              {repeatMode && (
                <span className="text-xs text-muted-foreground">
                  {t("cycle_no")}{cycleCount + (phase === "focus" ? 1 : 0)}
                </span>
              )}

              <TimerRing progress={timer.progress} size={isMobile ? 180 : 240}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`font-display font-bold tabular-nums text-foreground tracking-tight ${isMobile ? 'text-4xl' : 'text-5xl'}`}>
                    {pad(timer.minutes)}:{pad(timer.seconds)}
                  </div>
                </div>
              </TimerRing>

              {timer.status === "idle" && (
                <p className="text-badge-text text-sm inline-flex items-center gap-1.5">
                  <MousePointerClick className="w-4 h-4" />
                  {t("click_play")}
                </p>
              )}

              <div className="flex items-center gap-4">
                <button onClick={timer.toggle} className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                  {timer.status === "running" ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button onClick={handleReset} className="w-12 h-12 rounded-full bg-secondary hover:bg-muted text-secondary-foreground flex items-center justify-center transition-colors">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button onClick={handleBackToSetup} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("back_setup")}
                </button>
                {repeatMode && (
                  <button onClick={handleStop} className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors">
                    <Square className="w-3.5 h-3.5" />
                    {t("stop")}
                  </button>
                )}
              </div>
            </div>

            {!isMobile && (
              <div className="flex-shrink-0 mx-8">
                {phase === "focus" && (
                  theme === "flower" ? <GrowingFlower progress={timer.progress} variant={currentFlowerVariant} /> : <GrowingRocket progress={timer.progress} />
                )}
                {phase === "break" && (
                  <div className="flex flex-col items-center">
                    <Coffee className="w-24 h-24 text-primary animate-pulse" />
                    <span className="text-muted-foreground mt-3">{t("resting")}</span>
                  </div>
                )}
              </div>
            )}
          </div>
            <p className="text-center text-xs text-muted-foreground/80">
              copyright©all rights reserved by attayaarkarna12@gmail.com
            </p>
          </div>
        )}
      </main>

      <Garden gardenFlowers={gardenFlowers} isOpen={gardenOpen} onClose={() => setGardenOpen(false)} />
      <ChatHistory isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <StickyNotes />
      <HelpGuide />
    </div>
  );
};

export default Index;
