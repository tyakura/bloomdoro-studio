import { GrowingFlower, FlowerVariant } from "./GrowingFlower";
import { GrowingRocket } from "./GrowingRocket";
import { Coffee } from "lucide-react";
import { TimerTheme } from "./TimerSetup";

interface Props {
  minutes: number;
  seconds: number;
  progress: number;
  theme: TimerTheme;
  flowerVariant: FlowerVariant;
  phase: "focus" | "break";
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function MobileTimerHeader({ minutes, seconds, progress, theme, flowerVariant, phase }: Props) {
  return (
    <div className="md:hidden sticky top-0 left-0 right-0 z-[110] mx-3 mt-2 mb-2 rounded-2xl border border-border bg-card/85 backdrop-blur-md shadow-md px-3 py-2 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">
          {phase === "focus" ? "Fokus" : "Istirahat"}
        </span>
        <span className="font-display text-2xl font-bold tabular-nums leading-none">
          {pad(minutes)}:{pad(seconds)}
        </span>
      </div>
      <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center scale-[0.35] origin-center -mx-12">
        {phase === "focus" ? (
          theme === "flower" ? (
            <GrowingFlower progress={progress} variant={flowerVariant} />
          ) : (
            <GrowingRocket progress={progress} />
          )
        ) : (
          <Coffee className="w-10 h-10 text-primary animate-pulse" style={{ transform: "scale(2.8)" }} />
        )}
      </div>
    </div>
  );
}
