interface GrowingRocketProps {
  progress: number; // 0 to 1
  horizontal?: boolean;
}

export function GrowingRocket({ progress, horizontal = false }: GrowingRocketProps) {
  const p = Math.max(0, Math.min(1, progress));

  // Rocket rises from bottom to top
  const rocketY = 180 - p * 150;
  const flameScale = Math.max(0, Math.min(1, p * 2));
  const starOpacity = Math.max(0, (p - 0.3) / 0.7);
  const moonScale = Math.max(0, Math.min(1, (p - 0.5) / 0.5));
  const earthScale = Math.max(0.3, 1 - p * 0.6);
  const smokeOpacity = Math.max(0, Math.min(1, p * 3)) * (1 - Math.max(0, (p - 0.7) / 0.3));

  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40" style={{ overflow: "visible" }}>
      {/* Stars */}
      {[
        [30, 20], [170, 30], [20, 60], [180, 70], [50, 10],
        [140, 15], [90, 5], [160, 50], [40, 45], [120, 25],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={1.5}
          fill="hsl(var(--badge-text))"
          opacity={starOpacity * (0.5 + (i % 3) * 0.25)}
          style={{ transition: "all 1s ease-out" }}
        />
      ))}

      {/* Moon */}
      <circle
        cx="100"
        cy="25"
        r={18 * moonScale}
        fill="hsl(var(--muted-foreground))"
        opacity={moonScale * 0.9}
        style={{ transition: "all 1.2s ease-out" }}
      />
      <circle
        cx="108"
        cy="20"
        r={5 * moonScale}
        fill="hsl(var(--muted))"
        opacity={moonScale * 0.5}
        style={{ transition: "all 1.2s ease-out" }}
      />
      <circle
        cx="93"
        cy="30"
        r={3 * moonScale}
        fill="hsl(var(--muted))"
        opacity={moonScale * 0.4}
        style={{ transition: "all 1.2s ease-out" }}
      />

      {/* Earth */}
      <ellipse
        cx="100"
        cy="195"
        rx={60 * earthScale}
        ry={20 * earthScale}
        fill="hsl(var(--primary))"
        opacity={0.3 + earthScale * 0.3}
        style={{ transition: "all 1s ease-out" }}
      />

      {/* Smoke trail */}
      {[0, 1, 2].map((i) => (
        <ellipse
          key={`smoke-${i}`}
          cx={100 + (i - 1) * 8}
          cy={rocketY + 30 + i * 10}
          rx={6 + i * 3}
          ry={4 + i * 2}
          fill="hsl(var(--muted-foreground))"
          opacity={smokeOpacity * (0.3 - i * 0.08)}
          style={{ transition: "all 0.8s ease-out" }}
        />
      ))}

      {/* Rocket body */}
      <g style={{ transform: `translateY(${rocketY - 100}px)`, transition: "all 1s ease-out" }}>
        {/* Main body */}
        <rect x="92" y="100" width="16" height="30" rx="3" fill="hsl(var(--foreground))" />
        {/* Nose cone */}
        <polygon points="100,88 92,100 108,100" fill="hsl(var(--primary))" />
        {/* Window */}
        <circle cx="100" cy="108" r="4" fill="hsl(var(--badge-bg))" />
        <circle cx="100" cy="108" r="2.5" fill="hsl(var(--primary))" opacity="0.6" />
        {/* Fins */}
        <polygon points="92,125 85,135 92,130" fill="hsl(var(--primary))" />
        <polygon points="108,125 115,135 108,130" fill="hsl(var(--primary))" />

        {/* Flame */}
        <ellipse
          cx="100"
          cy="135"
          rx={5 * flameScale}
          ry={10 * flameScale}
          fill="hsl(var(--accent))"
          opacity={flameScale * 0.9}
          style={{ transition: "all 0.5s ease-out" }}
        />
        <ellipse
          cx="100"
          cy="133"
          rx={3 * flameScale}
          ry={6 * flameScale}
          fill="hsl(var(--badge-text))"
          opacity={flameScale * 0.8}
          style={{ transition: "all 0.5s ease-out" }}
        />
      </g>
    </svg>
  );
}
