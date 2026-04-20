import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Trophy, Flower2, Coffee, Square, MousePointerClick } from "lucide-react";
import { BloomdoroLogo } from "@/components/BloomdoroLogo";
import { TimerRing } from "@/components/TimerRing";
import { TimerSetup, TimerTheme } from "@/components/TimerSetup";
import { AmbientSounds } from "@/components/AmbientSounds";
import { SettingsModal } from "@/components/SettingsModal";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useTimer } from "@/hooks/useTimer";
import { GrowingFlower, FlowerVariant } from "@/components/GrowingFlower";
import { GrowingRocket } from "@/components/GrowingRocket";
import { CompletionScreen } from "@/components/CompletionScreen";
import { Garden } from "@/components/Garden";
import { StickyNotes } from "@/components/StickyNotes";
import { EasterEggBackground } from "@/components/EasterEggBackground";
import { useIsMobile } from "@/hooks/use-mobile";

type SessionPhase = "setup" | "focus" | "break" | "complete";

const Index = () => {
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [sessions, setSessions] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [repeatMode, setRepeatMode] = useState(false);
  const [cycleCount, setCycleCount] = useState(0); // completed focus cycles in repeat
  const [theme, setTheme] = useState<TimerTheme>("flower");
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string | null>(null);
  const [gardenOpen, setGardenOpen] = useState(false);
  const [gardenFlowers, setGardenFlowers] = useState<FlowerVariant[]>([]);
  const [currentFlowerVariant, setCurrentFlowerVariant] = useState<FlowerVariant>(0);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgIsVideo, setBgIsVideo] = useState(false);
  const [bgOverlay, setBgOverlay] = useState(70);
  const musicStopRef = useRef<(() => void) | null>(null);
  const isMobile = useIsMobile();
  const timer = useTimer(customMinutes);

  // Track total elapsed seconds in repeat mode for easter egg trigger
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
    // Stop repeat mode, award flowers for completed cycles
    timer.reset(customMinutes);
    if (cycleCount > 0 && theme === "flower") {
      const newFlowers: FlowerVariant[] = [];
      for (let i = 0; i < cycleCount; i++) {
        newFlowers.push((Math.floor(Math.random() * 4)) as FlowerVariant);
      }
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

  // Handle timer completion
  if (timer.status === "complete" && (phase === "focus" || phase === "break")) {
    musicStopRef.current?.();

    if (phase === "focus") {
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);
      setSessions((s) => s + 1);

      if (theme === "flower") {
        setGardenFlowers((prev) => [...prev.slice(0, 19), currentFlowerVariant]);
      }

      if (breakMinutes > 0) {
        // Switch to break
        timer.reset(breakMinutes);
        setPhase("break");
        setTimeout(() => timer.start(), 50);
      } else if (repeatMode) {
        // No break, repeat focus
        setCurrentFlowerVariant((Math.floor(Math.random() * 4)) as FlowerVariant);
        timer.reset(customMinutes);
        setPhase("focus");
        setTimeout(() => timer.start(), 50);
      } else {
        setPhase("complete");
      }
    } else if (phase === "break") {
      if (repeatMode) {
        // Start next focus cycle
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

  const isTimerPhase = phase === "focus" || phase === "break";

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background Image/Video */}
      {bgImage && (
        bgIsVideo ? (
          <video
            src={bgImage}
            autoPlay
            loop
            muted
            playsInline
            className="fixed inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div
            className="fixed inset-0 w-full h-full bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )
      )}
      {bgImage && <div className="fixed inset-0 z-0" style={{ backgroundColor: `hsl(var(--background) / ${bgOverlay / 100})` }} />}

      {/* Easter egg background (after 5min in repeat mode, lasts 3min) */}
      <EasterEggBackground
        elapsedSeconds={repeatElapsed}
        active={repeatMode && phase === "focus"}
        theme={theme}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-5xl w-full mx-auto relative z-[120]">
        <BloomdoroLogo />
        <div className="flex items-center gap-2 sm:gap-3">
          <MusicPlayer url={musicUrl} name={musicName} onClear={() => { setMusicUrl(null); setMusicName(null); }} stopRef={musicStopRef} />
          {!isMobile && (
            <>
              <AmbientSounds />
              <button
                onClick={() => setGardenOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                <Flower2 className="w-4 h-4" />
                Garden
              </button>
            </>
          )}
          <SettingsModal
            onMusicLoad={(url, name) => { setMusicUrl(url); setMusicName(name); }}
            showAmbient={isMobile}
            showGarden={isMobile}
            onGardenOpen={() => setGardenOpen(true)}
            onBgChange={(url, isVideo) => { setBgImage(url); setBgIsVideo(isVideo); }}
            bgImage={bgImage}
            overlayOpacity={bgOverlay}
            onOverlayChange={setBgOverlay}
          />
        </div>
      </header>

      {/* Session Counter */}
      <div className="flex justify-center mt-4 relative z-10">
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border shadow-sm">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold text-foreground">
            {sessions} Session{sessions !== 1 ? "s" : ""} Completed
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12 relative z-10">
        {phase === "setup" ? (
          <TimerSetup onStart={handleStart} defaultTheme={theme} />
        ) : phase === "complete" ? (
          <CompletionScreen
            lastMinutes={customMinutes}
            onReuse={handleReuse}
            onChangeTime={() => setPhase("setup")}
            cycleCount={cycleCount}
          />
        ) : (
          <div className={`flex ${isMobile ? 'flex-col items-center gap-8' : 'flex-row items-center justify-center'}`} style={!isMobile ? { gap: '120px' } : undefined}>
            {/* Animation on top for mobile */}
            {isMobile && (
              <div className="flex-shrink-0 my-6">
                {phase === "focus" && (
                  theme === "flower" ? (
                    <GrowingFlower progress={timer.progress} variant={currentFlowerVariant} />
                  ) : (
                    <GrowingRocket progress={timer.progress} />
                  )
                )}
                {phase === "break" && (
                  <div className="flex flex-col items-center">
                    <Coffee className="w-16 h-16 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground mt-2">Waktu Istirahat</span>
                  </div>
                )}
              </div>
            )}

            {/* Timer Card */}
            <div className="flex flex-col items-center gap-6 sm:gap-8 p-8 sm:p-10 rounded-2xl bg-card border border-border shadow-sm min-w-[320px] sm:min-w-[420px]">
              <span className={`px-4 py-1.5 rounded-full font-display font-semibold text-sm tracking-wide uppercase ${
                phase === "break"
                  ? "bg-accent/20 text-accent"
                  : "bg-badge-bg text-badge-text"
              }`}>
                {phase === "focus" ? "Focus Session" : (
                  <span className="inline-flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5" />
                    Break Time
                  </span>
                )}
              </span>

              {repeatMode && (
                <span className="text-xs text-muted-foreground">
                  Putaran ke-{cycleCount + (phase === "focus" ? 1 : 0)}
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
                  Klik play untuk memulai sesi!
                </p>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={timer.toggle}
                  className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                >
                  {timer.status === "running" ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="w-12 h-12 rounded-full bg-secondary hover:bg-muted text-secondary-foreground flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleBackToSetup}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Ganti waktu
                </button>
                {repeatMode && (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Hentikan
                  </button>
                )}
              </div>
            </div>

            {/* Animation on right for desktop */}
            {!isMobile && (
              <div className="flex-shrink-0 mx-8">
                {phase === "focus" && (
                  theme === "flower" ? (
                    <GrowingFlower progress={timer.progress} variant={currentFlowerVariant} />
                  ) : (
                    <GrowingRocket progress={timer.progress} />
                  )
                )}
                {phase === "break" && (
                  <div className="flex flex-col items-center">
                    <Coffee className="w-24 h-24 text-primary animate-pulse" />
                    <span className="text-muted-foreground mt-3">Waktu Istirahat</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Garden Modal */}
      <Garden gardenFlowers={gardenFlowers} isOpen={gardenOpen} onClose={() => setGardenOpen(false)} />

      {/* Sticky Notes */}
      <StickyNotes />
    </div>
  );
};

export default Index;
