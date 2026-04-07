import { useState, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Trophy, Flower2 } from "lucide-react";
import { BloomdoroLogo } from "@/components/BloomdoroLogo";
import { TimerRing } from "@/components/TimerRing";
import { TimerSetup, TimerTheme } from "@/components/TimerSetup";
import { SettingsModal } from "@/components/SettingsModal";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useTimer } from "@/hooks/useTimer";
import { GrowingFlower } from "@/components/GrowingFlower";
import { GrowingRocket } from "@/components/GrowingRocket";
import { CompletionScreen } from "@/components/CompletionScreen";
import { Garden } from "@/components/Garden";
import { StickyNotes } from "@/components/StickyNotes";
import { useIsMobile } from "@/hooks/use-mobile";
const Index = () => {
  const [phase, setPhase] = useState<"setup" | "timer" | "complete">("setup");
  const [sessions, setSessions] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [theme, setTheme] = useState<TimerTheme>("flower");
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string | null>(null);
  const [gardenOpen, setGardenOpen] = useState(false);
  const musicStopRef = useRef<(() => void) | null>(null);
  const timer = useTimer(customMinutes);

  const handleStart = useCallback((minutes: number, selectedTheme: TimerTheme) => {
    setCustomMinutes(minutes);
    setTheme(selectedTheme);
    timer.reset(minutes);
    setPhase("timer");
    setTimeout(() => timer.start(), 50);
  }, [timer]);

  const handleReset = useCallback(() => {
    timer.reset(customMinutes);
  }, [timer, customMinutes]);

  const handleBackToSetup = useCallback(() => {
    timer.reset(customMinutes);
    setPhase("setup");
  }, [timer, customMinutes]);

  const handleReuse = useCallback(() => {
    timer.reset(customMinutes);
    setPhase("timer");
    setTimeout(() => timer.start(), 50);
  }, [timer, customMinutes]);

  // Track completed sessions
  if (timer.status === "complete" && phase === "timer") {
    musicStopRef.current?.();
    setSessions((s) => s + 1);
    setPhase("complete");
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-5xl w-full mx-auto">
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
                Garden
              </button>
            </>
          )}
          <SettingsModal
            onMusicLoad={(url, name) => { setMusicUrl(url); setMusicName(name); }}
            showAmbient={isMobile}
            showGarden={isMobile}
            onGardenOpen={() => setGardenOpen(true)}
          />
        </div>
      </header>

      {/* Session Counter */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border shadow-sm">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold text-foreground">
            {sessions} Session{sessions !== 1 ? "s" : ""} Completed
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        {phase === "setup" ? (
          <TimerSetup onStart={handleStart} defaultTheme={theme} />
        ) : phase === "complete" ? (
          <CompletionScreen
            lastMinutes={customMinutes}
            onReuse={handleReuse}
            onChangeTime={() => setPhase("setup")}
          />
        ) : (
          <div className="flex items-center max-w-4xl w-full justify-center" style={{ gap: '120px' }}>
            {/* Timer Card */}
            <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-card border border-border shadow-sm">
              <span className="px-4 py-1.5 rounded-full bg-badge-bg text-badge-text font-display font-semibold text-sm tracking-wide uppercase">
                Focus Session
              </span>

              <TimerRing progress={timer.progress} size={240}>
                <div className="flex flex-col items-center gap-1">
                  <div className="font-display text-5xl font-bold tabular-nums text-foreground tracking-tight">
                    {pad(timer.minutes)}:{pad(timer.seconds)}
                  </div>
                </div>
              </TimerRing>

              {timer.status === "idle" && (
                <p className="text-badge-text text-sm">👆 Klik play untuk memulai sesi!</p>
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

              <button
                onClick={handleBackToSetup}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Ganti waktu
              </button>
            </div>

            {/* Animation outside the card */}
            <div className="flex-shrink-0">
              {theme === "flower" ? (
                <GrowingFlower progress={timer.progress} />
              ) : (
                <GrowingRocket progress={timer.progress} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Garden Modal */}
      <Garden sessions={sessions} isOpen={gardenOpen} onClose={() => setGardenOpen(false)} />

      {/* Sticky Notes */}
      <StickyNotes />
    </div>
  );
};

export default Index;
