import { useEffect, useState } from "react";
import type { TimerTheme } from "./TimerSetup";

interface EasterEggBackgroundProps {
  /** Total seconds the current repeat session has been running (across cycles) */
  elapsedSeconds: number;
  /** Whether repeat mode is active and we're in a focus phase */
  active: boolean;
  theme: TimerTheme;
}

const TRIGGER_AT = 5 * 60; // 5 minutes
const DURATION = 3 * 60; // visible for 3 minutes after trigger

export function EasterEggBackground({ elapsedSeconds, active, theme }: EasterEggBackgroundProps) {
  const [visible, setVisible] = useState(false);
  const [appearProgress, setAppearProgress] = useState(0); // 0..1 fade-in over time

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setAppearProgress(0);
      return;
    }
    if (elapsedSeconds >= TRIGGER_AT && elapsedSeconds < TRIGGER_AT + DURATION) {
      setVisible(true);
      // Fade-in over the first 30 seconds after trigger
      const since = elapsedSeconds - TRIGGER_AT;
      setAppearProgress(Math.min(1, since / 30));
    } else {
      setVisible(false);
    }
  }, [elapsedSeconds, active]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[5] transition-opacity duration-1000"
      style={{ opacity: appearProgress }}
      aria-hidden
    >
      {theme === "flower" ? <RootsAndFlowers progress={appearProgress} /> : <OuterSpace progress={appearProgress} />}
    </div>
  );
}

/* -------- Flower easter egg: roots creeping with little flowers -------- */
function RootsAndFlowers({ progress }: { progress: number }) {
  // 6 root paths from edges
  const roots = [
    { d: "M 0 100 C 80 80, 120 200, 220 180 S 360 260, 460 240", flowers: [[150, 175], [320, 245]] },
    { d: "M 100 0 C 120 100, 60 180, 140 280 S 220 460, 200 600", flowers: [[100, 200], [180, 420]] },
    { d: "M 100% 120 C calc(100% - 80px) 100, calc(100% - 180px) 220, calc(100% - 280px) 200", flowers: [] },
  ];

  // Use simpler SVG with viewBox spanning viewport scale
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="rootGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Vines from corners */}
      {[
        { d: "M 0 200 C 150 180 250 350 380 320 S 600 480 720 460 S 920 600 1000 580", color: "hsl(130 45% 35%)" },
        { d: "M 200 0 C 220 150 140 280 240 400 S 340 640 320 800 S 380 950 360 1000", color: "hsl(130 50% 30%)" },
        { d: "M 1000 250 C 870 230 760 380 660 360 S 460 500 320 480 S 100 620 0 600", color: "hsl(130 45% 38%)" },
        { d: "M 800 1000 C 780 870 850 740 760 620 S 660 400 680 240 S 620 80 640 0", color: "hsl(130 50% 33%)" },
      ].map((root, i) => (
        <g key={i}>
          <path
            d={root.d}
            stroke={root.color}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2000"
            strokeDashoffset={(1 - progress) * 2000}
            style={{ transition: "stroke-dashoffset 2s ease-out" }}
            filter="url(#rootGlow)"
            opacity={0.7}
          />
        </g>
      ))}

      {/* Tiny flowers scattered along roots */}
      {[
        [180, 220], [350, 340], [620, 450], [820, 560],
        [220, 180], [240, 410], [320, 700], [360, 920],
        [870, 240], [660, 370], [320, 490], [120, 590],
        [780, 880], [800, 620], [680, 240],
      ].map(([cx, cy], i) => {
        const colors = [
          { p: "hsl(340 70% 70%)", c: "hsl(45 85% 65%)" },
          { p: "hsl(280 60% 70%)", c: "hsl(50 75% 60%)" },
          { p: "hsl(15 75% 65%)", c: "hsl(45 85% 65%)" },
          { p: "hsl(200 65% 65%)", c: "hsl(55 75% 60%)" },
        ];
        const c = colors[i % colors.length];
        const delay = (i * 0.15) % 2;
        const scale = progress;
        return (
          <g
            key={`f-${i}`}
            style={{
              transform: `translate(${cx}px, ${cy}px) scale(${scale})`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: `transform 1.2s ease-out ${delay}s`,
            }}
          >
            {[0, 60, 120, 180, 240, 300].map((a) => {
              const px = Math.cos((a * Math.PI) / 180) * 6;
              const py = Math.sin((a * Math.PI) / 180) * 6;
              return (
                <ellipse
                  key={a}
                  cx={px}
                  cy={py}
                  rx={4.5}
                  ry={3}
                  fill={c.p}
                  opacity={0.85}
                  transform={`rotate(${a} ${px} ${py})`}
                />
              );
            })}
            <circle r={2.5} fill={c.c} />
          </g>
        );
      })}
    </svg>
  );
}

/* -------- Rocket easter egg: outer space background with stars/nebula -------- */
function OuterSpace({ progress }: { progress: number }) {
  // Pre-generate star positions
  const stars = Array.from({ length: 80 }, (_, i) => ({
    cx: (i * 137.5) % 1000,
    cy: (i * 89.7) % 1000,
    r: 0.5 + ((i * 13) % 10) / 5,
    delay: (i % 7) * 0.3,
  }));

  return (
    <>
      {/* Deep space gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsl(260 60% 25% / 0.85), transparent 60%), radial-gradient(ellipse at 70% 70%, hsl(220 70% 20% / 0.9), transparent 65%), linear-gradient(180deg, hsl(240 50% 8% / 0.85), hsl(260 60% 12% / 0.9))",
          opacity: progress,
          transition: "opacity 2s ease-out",
        }}
      />

      {/* Nebula clouds */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="nebulaA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(290 70% 60%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(290 70% 60%)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebulaB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(200 80% 65%)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(200 80% 65%)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebulaC" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(330 80% 65%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(330 80% 65%)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="200" cy="300" rx="280" ry="180" fill="url(#nebulaA)" opacity={progress} />
        <ellipse cx="780" cy="650" rx="320" ry="220" fill="url(#nebulaB)" opacity={progress} />
        <ellipse cx="500" cy="850" rx="260" ry="160" fill="url(#nebulaC)" opacity={progress} />

        {/* Stars */}
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="white"
            opacity={0.9}
          >
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${2 + (i % 3)}s`}
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* A few bigger stars with sparkle */}
        {[
          [120, 150], [880, 220], [340, 720], [720, 480], [550, 100],
        ].map(([cx, cy], i) => (
          <g key={`big-${i}`} opacity={progress}>
            <circle cx={cx} cy={cy} r={2.5} fill="white" />
            <line x1={(cx as number) - 8} y1={cy} x2={(cx as number) + 8} y2={cy} stroke="white" strokeWidth="0.6" opacity="0.7" />
            <line x1={cx} y1={(cy as number) - 8} x2={cx} y2={(cy as number) + 8} stroke="white" strokeWidth="0.6" opacity="0.7" />
          </g>
        ))}
      </svg>
    </>
  );
}
