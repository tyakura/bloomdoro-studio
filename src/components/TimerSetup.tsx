import { useState } from "react";
import { Minus, Plus, Play, Flower2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TimerTheme = "flower" | "rocket";

interface TimerSetupProps {
  onStart: (minutes: number, theme: TimerTheme) => void;
  defaultTheme?: TimerTheme;
}

const PRESETS = [15, 25, 30, 45, 60];

export function TimerSetup({ onStart, defaultTheme = "flower" }: TimerSetupProps) {
  const [minutes, setMinutes] = useState(25);
  const [theme, setTheme] = useState<TimerTheme>(defaultTheme);

  return (
    <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-card border border-border shadow-sm max-w-md w-full">
      <span className="px-4 py-1.5 rounded-full bg-badge-bg text-badge-text font-display font-semibold text-sm tracking-wide uppercase">
        Set Your Focus Time
      </span>

      {/* Theme Picker */}
      <div className="flex flex-col items-center gap-3 w-full">
        <span className="text-sm font-medium text-muted-foreground">Pilih Tema Animasi</span>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme("flower")}
            className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
              theme === "flower"
                ? "border-primary bg-badge-bg shadow-sm"
                : "border-border bg-secondary hover:bg-muted"
            }`}
          >
            <Flower2 className={`w-8 h-8 ${theme === "flower" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${theme === "flower" ? "text-primary" : "text-muted-foreground"}`}>
              🌸 Bunga Tumbuh
            </span>
          </button>
          <button
            onClick={() => setTheme("rocket")}
            className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
              theme === "rocket"
                ? "border-primary bg-badge-bg shadow-sm"
                : "border-border bg-secondary hover:bg-muted"
            }`}
          >
            <Rocket className={`w-8 h-8 ${theme === "rocket" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${theme === "rocket" ? "text-primary" : "text-muted-foreground"}`}>
              🚀 Roket ke Bulan
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => setMinutes((m) => Math.max(1, m - 5))}
          className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-muted transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="font-display text-7xl font-bold tabular-nums text-foreground min-w-[120px] text-center">
          {minutes}
        </div>
        <button
          onClick={() => setMinutes((m) => Math.min(120, m + 5))}
          className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-muted transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <span className="text-muted-foreground text-sm -mt-4">minutes</span>

      <div className="flex gap-2 flex-wrap justify-center">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setMinutes(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              minutes === p
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {p}m
          </button>
        ))}
      </div>

      <Button
        onClick={() => onStart(minutes, theme)}
        className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        size="icon"
      >
        <Play className="w-6 h-6 ml-0.5" />
      </Button>
    </div>
  );
}
