export type FlowerVariant = 0 | 1 | 2 | 3;

interface GrowingFlowerProps {
  progress: number; // 0 to 1
  variant?: FlowerVariant;
}

const VARIANTS = [
  {
    petals: "hsl(340 60% 65%)",
    center: "hsl(45 80% 60%)",
    vase: "hsl(20 50% 55%)",
    vaseAccent: "hsl(20 40% 45%)",
    petalCount: 8,
    petalRx: 7,
    petalRy: 5,
  },
  {
    petals: "hsl(280 50% 65%)",
    center: "hsl(50 70% 55%)",
    vase: "hsl(280 30% 50%)",
    vaseAccent: "hsl(280 25% 40%)",
    petalCount: 6,
    petalRx: 8,
    petalRy: 4,
  },
  {
    petals: "hsl(200 60% 60%)",
    center: "hsl(55 70% 55%)",
    vase: "hsl(200 35% 50%)",
    vaseAccent: "hsl(200 30% 40%)",
    petalCount: 10,
    petalRx: 6,
    petalRy: 6,
  },
  {
    petals: "hsl(350 55% 55%)",
    center: "hsl(45 90% 65%)",
    vase: "hsl(160 40% 45%)",
    vaseAccent: "hsl(160 35% 35%)",
    petalCount: 7,
    petalRx: 9,
    petalRy: 4,
  },
];

export function GrowingFlower({ progress, variant = 0 }: GrowingFlowerProps) {
  const p = Math.max(0, Math.min(1, progress));
  const v = VARIANTS[variant % VARIANTS.length];

  const stemHeight = Math.min(1, p / 0.4) * 55;
  const leafScale = Math.max(0, Math.min(1, (p - 0.2) / 0.4));
  const petalScale = Math.max(0, Math.min(1, (p - 0.4) / 0.6));
  const centerScale = Math.max(0, Math.min(1, (p - 0.6) / 0.4));

  const angles = Array.from({ length: v.petalCount }, (_, i) => (360 / v.petalCount) * i);

  return (
    <svg
      viewBox="0 0 100 110"
      className="w-56 h-56 animate-sway"
      style={{ overflow: "visible", transformOrigin: "50% 100%" }}
    >
      {/* Vase */}
      <path
        d="M38 92 L36 108 Q36 112 50 112 Q64 112 64 108 L62 92 Z"
        fill={v.vase}
        stroke={v.vaseAccent}
        strokeWidth="1"
        className="dark:stroke-white/40"
      />
      <ellipse cx="50" cy="92" rx="13" ry="3" fill={v.vaseAccent} opacity="0.5" />

      {/* Stem */}
      <line
        x1="50"
        y1="92"
        x2="50"
        y2={92 - stemHeight}
        stroke="hsl(130 40% 45%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        opacity={p > 0 ? 1 : 0}
        className="dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]"
      />

      {/* Left leaf */}
      <ellipse
        cx="42"
        cy={92 - stemHeight * 0.5}
        rx={8 * leafScale}
        ry={4 * leafScale}
        fill="hsl(130 40% 45%)"
        transform={`rotate(-30 42 ${92 - stemHeight * 0.5})`}
        style={{ transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        opacity={leafScale}
      />

      {/* Right leaf */}
      <ellipse
        cx="58"
        cy={92 - stemHeight * 0.65}
        rx={8 * leafScale}
        ry={4 * leafScale}
        fill="hsl(130 40% 50%)"
        transform={`rotate(30 58 ${92 - stemHeight * 0.65})`}
        style={{ transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        opacity={leafScale}
      />

      {/* Petals */}
      {angles.map((angle, i) => {
        const cx = 50 + Math.cos((angle * Math.PI) / 180) * 12 * petalScale;
        const cy = 92 - stemHeight + Math.sin((angle * Math.PI) / 180) * 12 * petalScale;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={v.petalRx * petalScale}
            ry={v.petalRy * petalScale}
            fill={v.petals}
            opacity={petalScale * 0.85}
            transform={`rotate(${angle} ${cx} ${cy})`}
            style={{ transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
            className="dark:stroke-white/25"
            strokeWidth={petalScale > 0.1 ? 0.5 : 0}
          />
        );
      })}

      {/* Center */}
      <circle
        cx="50"
        cy={92 - stemHeight}
        r={5 * centerScale}
        fill={v.center}
        opacity={centerScale}
        style={{ transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        className="dark:stroke-white/30"
        strokeWidth={centerScale > 0.1 ? 0.8 : 0}
      />
    </svg>
  );
}
