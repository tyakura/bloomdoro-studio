import { useState } from "react";
import { Minus, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerSetupProps {
  onStart: (minutes: number) => void;
}

const PRESETS = [15, 25, 30, 45, 60];

export function TimerSetup({ onStart }: TimerSetupProps) {
  const [minutes, setMinutes] = useState(25);

  return (
    <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-card border border-border shadow-sm max-w-md w-full">
      <span className="px-4 py-1.5 rounded-full bg-badge-bg text-badge-text font-display font-semibold text-sm tracking-wide uppercase">
        Set Your Focus Time
      </span>

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
        onClick={() => onStart(minutes)}
        className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        size="icon"
      >
        <Play className="w-6 h-6 ml-0.5" />
      </Button>
    </div>
  );
}
