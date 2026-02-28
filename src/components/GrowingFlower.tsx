interface GrowingFlowerProps {
  progress: number; // 0 to 1
}

export function GrowingFlower({ progress }: GrowingFlowerProps) {
  // Clamp progress
  const p = Math.max(0, Math.min(1, progress));

  // Stem grows first (0-40%), then leaves (20-60%), then petals (40-100%)
  const stemHeight = Math.min(1, p / 0.4) * 60;
  const leafScale = Math.max(0, Math.min(1, (p - 0.2) / 0.4));
  const petalScale = Math.max(0, Math.min(1, (p - 0.4) / 0.6));
  const centerScale = Math.max(0, Math.min(1, (p - 0.6) / 0.4));

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-16 h-16"
      style={{ overflow: "visible" }}
    >
      {/* Stem */}
      <line
        x1="50"
        y1="90"
        x2="50"
        y2={90 - stemHeight}
        stroke="hsl(var(--badge-text))"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transition: "all 1s ease-out" }}
        opacity={p > 0 ? 1 : 0}
      />

      {/* Left leaf */}
      <ellipse
        cx="42"
        cy={90 - stemHeight * 0.5}
        rx={8 * leafScale}
        ry={4 * leafScale}
        fill="hsl(130 40% 45%)"
        transform={`rotate(-30 42 ${90 - stemHeight * 0.5})`}
        style={{ transition: "all 1s ease-out" }}
        opacity={leafScale}
      />

      {/* Right leaf */}
      <ellipse
        cx="58"
        cy={90 - stemHeight * 0.65}
        rx={8 * leafScale}
        ry={4 * leafScale}
        fill="hsl(130 40% 50%)"
        transform={`rotate(30 58 ${90 - stemHeight * 0.65})`}
        style={{ transition: "all 1s ease-out" }}
        opacity={leafScale}
      />

      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const cx = 50 + Math.cos((angle * Math.PI) / 180) * 12 * petalScale;
        const cy =
          90 - stemHeight + Math.sin((angle * Math.PI) / 180) * 12 * petalScale;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={7 * petalScale}
            ry={5 * petalScale}
            fill="hsl(var(--primary))"
            opacity={petalScale * 0.85}
            transform={`rotate(${angle} ${cx} ${cy})`}
            style={{ transition: "all 1s ease-out" }}
          />
        );
      })}

      {/* Center */}
      <circle
        cx="50"
        cy={90 - stemHeight}
        r={5 * centerScale}
        fill="hsl(var(--badge-text))"
        opacity={centerScale}
        style={{ transition: "all 1s ease-out" }}
      />
    </svg>
  );
}
