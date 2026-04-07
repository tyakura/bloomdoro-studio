import { Flower2, X } from "lucide-react";
import type { FlowerVariant } from "./GrowingFlower";

const TOTAL_SLOTS = 20;

const FLOWER_VARIANTS = [
  { petals: "hsl(340 60% 65%)", center: "hsl(45 80% 60%)", vase: "hsl(20 50% 55%)" },
  { petals: "hsl(280 50% 65%)", center: "hsl(50 70% 55%)", vase: "hsl(280 30% 50%)" },
  { petals: "hsl(200 60% 60%)", center: "hsl(55 70% 55%)", vase: "hsl(200 35% 50%)" },
  { petals: "hsl(350 55% 55%)", center: "hsl(45 90% 65%)", vase: "hsl(160 40% 45%)" },
];

const PETAL_CONFIGS = [
  { count: 8, rx: 6, ry: 4 },
  { count: 6, rx: 7, ry: 3.5 },
  { count: 10, rx: 5, ry: 5 },
  { count: 7, rx: 8, ry: 3.5 },
];

function GardenFlower({ variant }: { variant: FlowerVariant }) {
  const v = FLOWER_VARIANTS[variant % FLOWER_VARIANTS.length];
  const pc = PETAL_CONFIGS[variant % PETAL_CONFIGS.length];
  const angles = Array.from({ length: pc.count }, (_, i) => (360 / pc.count) * i);

  return (
    <svg viewBox="0 0 60 70" className="w-full h-full animate-sway" style={{ transformOrigin: "50% 100%" }}>
      {/* Vase */}
      <path d="M24 52 L22 66 Q22 69 30 69 Q38 69 38 66 L36 52 Z" fill={v.vase} />
      {/* Stem */}
      <line x1="30" y1="52" x2="30" y2="28" stroke="hsl(130 40% 45%)" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="24" cy="42" rx="4" ry="2" fill="hsl(130 40% 50%)" transform="rotate(-30 24 42)" />
      <ellipse cx="36" cy="37" rx="4" ry="2" fill="hsl(130 40% 55%)" transform="rotate(30 36 37)" />
      {/* Petals */}
      {angles.map((angle) => {
        const cx = 30 + Math.cos((angle * Math.PI) / 180) * 8;
        const cy = 22 + Math.sin((angle * Math.PI) / 180) * 8;
        return (
          <ellipse key={angle} cx={cx} cy={cy} rx={pc.rx} ry={pc.ry} fill={v.petals} opacity={0.85} transform={`rotate(${angle} ${cx} ${cy})`} />
        );
      })}
      {/* Center */}
      <circle cx="30" cy="22" r="3.5" fill={v.center} />
    </svg>
  );
}

interface GardenProps {
  gardenFlowers: FlowerVariant[];
  isOpen: boolean;
  onClose: () => void;
}

export function Garden({ gardenFlowers, isOpen, onClose }: GardenProps) {
  if (!isOpen) return null;

  const filledSlots = Math.min(gardenFlowers.length, TOTAL_SLOTS);

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
                <GardenFlower variant={gardenFlowers[i]} />
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
