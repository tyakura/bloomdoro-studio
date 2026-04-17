interface GrowingRocketProps {
  progress: number; // 0 to 1
  horizontal?: boolean;
}

export function GrowingRocket({ progress, horizontal = false }: GrowingRocketProps) {
  const p = Math.max(0, Math.min(1, progress));

  // Phase timing:
  // 0.00 - 0.08: ignition (flame builds up while rocket sits on pad)
  // 0.08 - 0.95: liftoff (rocket rises)
  // 0.95 - 1.00: landing on moon
  const ignitionProgress = Math.min(1, p / 0.08);
  const liftoffProgress = Math.max(0, Math.min(1, (p - 0.08) / 0.87));
  const isLanding = p >= 0.95;
  const landingProgress = isLanding ? Math.min(1, (p - 0.95) / 0.05) : 0;

  const baseY = 180; // rocket sits on pad
  const rocketY = isLanding
    ? 30 + landingProgress * 5
    : baseY - liftoffProgress * 150;

  const rocketRotation = isLanding ? 180 * landingProgress : 0;

  // Flame ignites first, then sustains during flight, then dies on landing
  const flameScale = isLanding
    ? Math.max(0, 1 - landingProgress * 3)
    : ignitionProgress;

  // Stars and moon appear after liftoff begins
  const starOpacity = Math.max(0, Math.min(1, (p - 0.15) / 0.5));
  const moonScale = Math.max(0, Math.min(1, (p - 0.25) / 0.4));
  const earthScale = Math.max(0.6, 1 - liftoffProgress * 0.3);
  const smokeOpacity = isLanding ? 0 : ignitionProgress * (1 - Math.max(0, (liftoffProgress - 0.5) / 0.5)) * 0.8;

  // Earth/landing pad - wider now, positioned at fin tips
  const earthY = 198;

  return (
    <svg viewBox="0 0 200 200" className={horizontal ? "w-72 h-44" : "w-64 h-64"} style={{ overflow: "visible", transform: horizontal ? "rotate(-90deg)" : undefined }}>
      <defs>
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

      {/* Stars - bigger and more sparkle */}
      {[
        [30, 20, 2.5], [170, 30, 2], [20, 60, 2.2], [180, 70, 2.5], [50, 10, 1.8],
        [140, 15, 2.3], [90, 5, 2], [160, 50, 1.8], [40, 45, 2.2], [120, 25, 2.5],
        [15, 90, 2], [185, 100, 1.8], [70, 35, 1.6], [130, 60, 2],
      ].map(([cx, cy, r], i) => (
        <g key={i} opacity={starOpacity * (0.6 + (i % 3) * 0.2)} style={{ transition: "all 1s ease-out" }}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="hsl(var(--badge-text))"
          />
          {/* Sparkle cross for bigger stars */}
          {(r as number) >= 2 && (
            <>
              <line x1={(cx as number) - (r as number) * 2} y1={cy} x2={(cx as number) + (r as number) * 2} y2={cy} stroke="hsl(var(--badge-text))" strokeWidth="0.4" opacity="0.7" />
              <line x1={cx} y1={(cy as number) - (r as number) * 2} x2={cx} y2={(cy as number) + (r as number) * 2} stroke="hsl(var(--badge-text))" strokeWidth="0.4" opacity="0.7" />
            </>
          )}
        </g>
      ))}

      {/* Moon - significantly bigger */}
      <circle
        cx="100"
        cy="30"
        r={42 * moonScale}
        fill="hsl(var(--muted-foreground))"
        opacity={moonScale * 0.9}
        className="dark:stroke-white/30"
        strokeWidth={moonScale > 0.1 ? 1 : 0}
        style={{ transition: "all 1.2s ease-out" }}
      />
      <circle cx="118" cy="20" r={11 * moonScale} fill="hsl(var(--muted))" opacity={moonScale * 0.4} style={{ transition: "all 1.2s ease-out" }} />
      <circle cx="85" cy="35" r={6 * moonScale} fill="hsl(var(--muted))" opacity={moonScale * 0.35} style={{ transition: "all 1.2s ease-out" }} />
      <circle cx="108" cy="45" r={5 * moonScale} fill="hsl(var(--muted))" opacity={moonScale * 0.3} style={{ transition: "all 1.2s ease-out" }} />
      <circle cx="92" cy="18" r={3.5 * moonScale} fill="hsl(var(--muted))" opacity={moonScale * 0.35} style={{ transition: "all 1.2s ease-out" }} />
      <ellipse
        cx="100"
        cy={30 + 42 * moonScale - 3}
        rx={33 * moonScale}
        ry={4 * moonScale}
        fill="hsl(var(--muted))"
        opacity={moonScale * 0.2}
        style={{ transition: "all 1.2s ease-out" }}
      />

      {/* Flag on moon */}
      {isLanding && landingProgress > 0.5 && (
        <g opacity={Math.min(1, (landingProgress - 0.5) * 4)} style={{ transition: "all 0.5s ease-out" }}>
          <line x1="80" y1="58" x2="80" y2="42" stroke="hsl(var(--foreground))" strokeWidth="1.2" />
          <rect x="80" y="42" width="13" height="8" fill="hsl(var(--primary))" rx="1" />
        </g>
      )}

      {/* Landing pad / Earth - wider */}
      <ellipse
        cx="100"
        cy={earthY}
        rx={90 * earthScale}
        ry={14 * earthScale}
        fill="hsl(var(--primary))"
        opacity={0.25}
        style={{ transition: "all 1s ease-out" }}
      />
      <ellipse
        cx="100"
        cy={earthY - 3}
        rx={80 * earthScale}
        ry={10 * earthScale}
        fill="hsl(var(--primary))"
        opacity={0.45}
        style={{ transition: "all 1s ease-out" }}
      />
      <ellipse
        cx="100"
        cy={earthY - 5}
        rx={68 * earthScale}
        ry={7 * earthScale}
        fill="hsl(var(--primary))"
        opacity={0.6}
        style={{ transition: "all 1s ease-out" }}
      />

      {/* Smoke trail */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={`smoke-${i}`}
          cx={100 + (i - 1.5) * 10}
          cy={rocketY + 35 + i * 12}
          rx={7 + i * 3}
          ry={5 + i * 2}
          fill="hsl(var(--muted-foreground))"
          opacity={smokeOpacity * (0.35 - i * 0.07)}
          style={{ transition: "all 0.8s ease-out" }}
        />
      ))}

      {/* Rocket group - flame drawn FIRST (behind), then body on top */}
      <g style={{
        transform: `translateY(${rocketY - baseY}px) rotate(${rocketRotation}deg)`,
        transformOrigin: "100px 115px",
        transition: "transform 1s ease-out"
      }}>
        {/* === FLAME (behind rocket) === */}
        {flameScale > 0.1 && (
          <>
            {/* Flame sparks */}
            <circle cx="96" cy="148" r={1.8 * flameScale} fill="hsl(30 100% 60%)" opacity={flameScale * 0.6}>
              <animate attributeName="cy" values="148;158;148" dur="0.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${flameScale * 0.6};0;${flameScale * 0.6}`} dur="0.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="104" cy="150" r={1.3 * flameScale} fill="hsl(40 100% 65%)" opacity={flameScale * 0.5}>
              <animate attributeName="cy" values="150;160;150" dur="0.35s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${flameScale * 0.5};0;${flameScale * 0.5}`} dur="0.35s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="152" r={1.5 * flameScale} fill="hsl(25 90% 55%)" opacity={flameScale * 0.4}>
              <animate attributeName="cy" values="152;164;152" dur="0.45s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${flameScale * 0.4};0;${flameScale * 0.4}`} dur="0.45s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Outer glow */}
        <ellipse
          cx="100"
          cy="140"
          rx={9 * flameScale}
          ry={20 * flameScale}
          fill="url(#flameOuter)"
          opacity={flameScale * 0.7}
        >
          <animate attributeName="ry" values={`${20 * flameScale};${24 * flameScale};${18 * flameScale};${20 * flameScale}`} dur="0.3s" repeatCount="indefinite" />
          <animate attributeName="rx" values={`${9 * flameScale};${7 * flameScale};${10 * flameScale};${9 * flameScale}`} dur="0.25s" repeatCount="indefinite" />
          <animate attributeName="opacity" values={`${flameScale * 0.7};${flameScale * 0.5};${flameScale * 0.8};${flameScale * 0.7}`} dur="0.2s" repeatCount="indefinite" />
        </ellipse>

        {/* Main flame */}
        <ellipse
          cx="100"
          cy="138"
          rx={7 * flameScale}
          ry={16 * flameScale}
          fill="url(#flameInner)"
          opacity={flameScale * 0.95}
        >
          <animate attributeName="ry" values={`${16 * flameScale};${19 * flameScale};${14 * flameScale};${16 * flameScale}`} dur="0.2s" repeatCount="indefinite" />
          <animate attributeName="rx" values={`${7 * flameScale};${6 * flameScale};${8 * flameScale};${7 * flameScale}`} dur="0.15s" repeatCount="indefinite" />
        </ellipse>

        {/* Inner bright core */}
        <ellipse
          cx="100"
          cy="136"
          rx={3.5 * flameScale}
          ry={9 * flameScale}
          fill="hsl(55 100% 90%)"
          opacity={flameScale * 0.85}
        >
          <animate attributeName="ry" values={`${9 * flameScale};${11 * flameScale};${8 * flameScale};${9 * flameScale}`} dur="0.18s" repeatCount="indefinite" />
        </ellipse>

        {/* === ROCKET BODY (on top of flame) === */}
        {/* Fins */}
        <polygon points="90,127 81,140 90,133" fill="hsl(var(--primary))"
          className="dark:stroke-white/30" strokeWidth="0.5" />
        <polygon points="110,127 119,140 110,133" fill="hsl(var(--primary))"
          className="dark:stroke-white/30" strokeWidth="0.5" />
        {/* Main body */}
        <rect x="90" y="97" width="20" height="36" rx="4" fill="hsl(var(--foreground))"
          className="dark:stroke-white/50" strokeWidth="1" />
        {/* Nose cone */}
        <polygon points="100,83 90,97 110,97" fill="hsl(var(--primary))"
          className="dark:stroke-white/40" strokeWidth="0.8" />
        {/* Window */}
        <circle cx="100" cy="107" r="5" fill="hsl(var(--badge-bg))" />
        <circle cx="100" cy="107" r="3" fill="hsl(var(--primary))" opacity="0.6" />
      </g>
    </svg>
  );
}
