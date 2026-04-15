interface GrowingRocketProps {
  progress: number; // 0 to 1
  horizontal?: boolean;
}

export function GrowingRocket({ progress, horizontal = false }: GrowingRocketProps) {
  const p = Math.max(0, Math.min(1, progress));

  const isLanding = p >= 0.95;
  const landingProgress = isLanding ? Math.min(1, (p - 0.95) / 0.05) : 0;

  const rocketY = isLanding
    ? 30 + landingProgress * 5
    : 180 - p * 150;

  const rocketRotation = isLanding ? 180 * landingProgress : 0;

  const flameScale = isLanding ? Math.max(0, 1 - landingProgress * 3) : Math.max(0, Math.min(1, p * 2));
  const starOpacity = Math.max(0, (p - 0.3) / 0.7);
  const moonScale = Math.max(0, Math.min(1, (p - 0.3) / 0.4));
  const earthScale = Math.max(0.3, 1 - p * 0.6);
  const smokeOpacity = isLanding ? 0 : Math.max(0, Math.min(1, p * 3)) * (1 - Math.max(0, (p - 0.7) / 0.3));

  return (
    <svg viewBox="0 0 200 200" className={horizontal ? "w-64 h-40" : "w-56 h-56"} style={{ overflow: "visible", transform: horizontal ? "rotate(-90deg)" : undefined }}>
      <defs>
        {/* Animated flame gradient */}
        <radialGradient id="flameOuter" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="hsl(45 100% 60%)" />
          <stop offset="50%" stopColor="hsl(25 100% 55%)" />
          <stop offset="100%" stopColor="hsl(10 90% 50%)" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="flameInner" cx="50%" cy="20%" r="50%">
          <stop offset="0%" stopColor="hsl(55 100% 85%)" />
          <stop offset="60%" stopColor="hsl(45 100% 65%)" />
          <stop offset="100%" stopColor="hsl(30 100% 55%)" stopOpacity="0.5" />
        </radialGradient>
      </defs>

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
        r={28 * moonScale}
        fill="hsl(var(--muted-foreground))"
        opacity={moonScale * 0.9}
        className="dark:stroke-white/30"
        strokeWidth={moonScale > 0.1 ? 1 : 0}
        style={{ transition: "all 1.2s ease-out" }}
      />
      <circle cx="112" cy="18" r={7 * moonScale} fill="hsl(var(--muted))" opacity={moonScale * 0.4} style={{ transition: "all 1.2s ease-out" }} />
      <circle cx="90" cy="28" r={4 * moonScale} fill="hsl(var(--muted))" opacity={moonScale * 0.35} style={{ transition: "all 1.2s ease-out" }} />
      <circle cx="105" cy="35" r={3 * moonScale} fill="hsl(var(--muted))" opacity={moonScale * 0.3} style={{ transition: "all 1.2s ease-out" }} />
      <ellipse
        cx="100"
        cy={25 + 28 * moonScale - 2}
        rx={22 * moonScale}
        ry={3 * moonScale}
        fill="hsl(var(--muted))"
        opacity={moonScale * 0.2}
        style={{ transition: "all 1.2s ease-out" }}
      />

      {/* Flag on moon */}
      {isLanding && landingProgress > 0.5 && (
        <g opacity={Math.min(1, (landingProgress - 0.5) * 4)} style={{ transition: "all 0.5s ease-out" }}>
          <line x1="85" y1="48" x2="85" y2="38" stroke="hsl(var(--foreground))" strokeWidth="1" />
          <rect x="85" y="38" width="10" height="6" fill="hsl(var(--primary))" rx="1" />
        </g>
      )}

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
      <g style={{
        transform: `translateY(${rocketY - 100}px) rotate(${rocketRotation}deg)`,
        transformOrigin: "100px 115px",
        transition: "all 1s ease-out"
      }}>
        {/* Main body - with dark mode border */}
        <rect x="90" y="97" width="20" height="36" rx="4" fill="hsl(var(--foreground))"
          className="dark:stroke-white/50" strokeWidth="1" />
        {/* Nose cone */}
        <polygon points="100,83 90,97 110,97" fill="hsl(var(--primary))"
          className="dark:stroke-white/40" strokeWidth="0.8" />
        {/* Window */}
        <circle cx="100" cy="107" r="5" fill="hsl(var(--badge-bg))" />
        <circle cx="100" cy="107" r="3" fill="hsl(var(--primary))" opacity="0.6" />
        {/* Fins */}
        <polygon points="90,127 81,140 90,133" fill="hsl(var(--primary))"
          className="dark:stroke-white/30" strokeWidth="0.5" />
        <polygon points="110,127 119,140 110,133" fill="hsl(var(--primary))"
          className="dark:stroke-white/30" strokeWidth="0.5" />

        {/* Animated Flame - outer glow */}
        <ellipse
          cx="100"
          cy="140"
          rx={8 * flameScale}
          ry={18 * flameScale}
          fill="url(#flameOuter)"
          opacity={flameScale * 0.6}
        >
          <animate attributeName="ry" values={`${18 * flameScale};${22 * flameScale};${16 * flameScale};${18 * flameScale}`} dur="0.3s" repeatCount="indefinite" />
          <animate attributeName="rx" values={`${8 * flameScale};${6 * flameScale};${9 * flameScale};${8 * flameScale}`} dur="0.25s" repeatCount="indefinite" />
          <animate attributeName="opacity" values={`${flameScale * 0.6};${flameScale * 0.4};${flameScale * 0.7};${flameScale * 0.6}`} dur="0.2s" repeatCount="indefinite" />
        </ellipse>

        {/* Main flame */}
        <ellipse
          cx="100"
          cy="138"
          rx={6 * flameScale}
          ry={14 * flameScale}
          fill="url(#flameInner)"
          opacity={flameScale * 0.9}
        >
          <animate attributeName="ry" values={`${14 * flameScale};${17 * flameScale};${12 * flameScale};${14 * flameScale}`} dur="0.2s" repeatCount="indefinite" />
          <animate attributeName="rx" values={`${6 * flameScale};${5 * flameScale};${7 * flameScale};${6 * flameScale}`} dur="0.15s" repeatCount="indefinite" />
        </ellipse>

        {/* Inner bright core */}
        <ellipse
          cx="100"
          cy="136"
          rx={3 * flameScale}
          ry={8 * flameScale}
          fill="hsl(55 100% 90%)"
          opacity={flameScale * 0.8}
        >
          <animate attributeName="ry" values={`${8 * flameScale};${10 * flameScale};${7 * flameScale};${8 * flameScale}`} dur="0.18s" repeatCount="indefinite" />
        </ellipse>

        {/* Flame sparks */}
        {flameScale > 0.3 && (
          <>
            <circle cx="96" cy="148" r={1.5 * flameScale} fill="hsl(30 100% 60%)" opacity={flameScale * 0.5}>
              <animate attributeName="cy" values="148;155;148" dur="0.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${flameScale * 0.5};0;${flameScale * 0.5}`} dur="0.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="104" cy="150" r={1 * flameScale} fill="hsl(40 100% 65%)" opacity={flameScale * 0.4}>
              <animate attributeName="cy" values="150;158;150" dur="0.35s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${flameScale * 0.4};0;${flameScale * 0.4}`} dur="0.35s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="152" r={1.2 * flameScale} fill="hsl(25 90% 55%)" opacity={flameScale * 0.3}>
              <animate attributeName="cy" values="152;162;152" dur="0.45s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${flameScale * 0.3};0;${flameScale * 0.3}`} dur="0.45s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>
    </svg>
  );
}
