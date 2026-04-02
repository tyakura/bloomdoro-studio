import { useState } from "react";
import { Flower2, X } from "lucide-react";

const TOTAL_SLOTS = 20;

const FLOWER_VARIANTS = [
  { petals: "hsl(340 60% 65%)", center: "hsl(45 80% 60%)" },
  { petals: "hsl(280 50% 65%)", center: "hsl(50 70% 55%)" },
  { petals: "hsl(20 70% 65%)", center: "hsl(40 80% 50%)" },
  { petals: "hsl(200 60% 60%)", center: "hsl(55 70% 55%)" },
  { petals: "hsl(350 55% 55%)", center: "hsl(45 90% 65%)" },
  { petals: "hsl(160 40% 50%)", center: "hsl(50 60% 55%)" },
];

function GardenFlower({ index }: { index: number }) {
  const variant = FLOWER_VARIANTS[index % FLOWER_VARIANTS.length];
  const rotation = (index * 37) % 360;

  return (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      {/* Stem */}
      <line x1="30" y1="58" x2="30" y2="32" stroke="hsl(130 40% 45%)" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="45" rx="5" ry="2.5" fill="hsl(130 40% 50%)" transform="rotate(-30 24 45)" />
      <ellipse cx="36" cy="40" rx="5" ry="2.5" fill="hsl(130 40% 55%)" transform="rotate(30 36 40)" />
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const cx = 30 + Math.cos(((angle + rotation) * Math.PI) / 180) * 9;
        const cy = 25 + Math.sin(((angle + rotation) * Math.PI) / 180) * 9;
        return (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy}
            rx={6}
            ry={4}
            fill={variant.petals}
            opacity={0.85}
            transform={`rotate(${angle + rotation} ${cx} ${cy})`}
          />
        );
      })}
      {/* Center */}
      <circle cx="30" cy="25" r="4" fill={variant.center} />
    </svg>
  );
}

interface GardenProps {
  sessions: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Garden({ sessions, isOpen, onClose }: GardenProps) {
  if (!isOpen) return null;

  const filledSlots = Math.min(sessions, TOTAL_SLOTS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-display text-xl font-bold text-foreground">🌸 My Garden</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filledSlots}/{TOTAL_SLOTS} bunga terkumpul
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                i < filledSlots
                  ? "border-primary/30 bg-badge-bg"
                  : "border-border bg-secondary/50"
              }`}
            >
              {i < filledSlots ? (
                <GardenFlower index={i} />
              ) : (
                <Flower2 className="w-6 h-6 text-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>

        {filledSlots >= TOTAL_SLOTS && (
          <p className="text-center text-sm text-primary font-semibold mt-4">
            🎉 Taman kamu sudah penuh! Luar biasa!
          </p>
        )}
      </div>
    </div>
  );
}
