import { useState, useEffect, useCallback, useRef } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "complete";

export function useTimer(initialMinutes: number) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((newMinutes?: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const secs = (newMinutes ?? initialMinutes) * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setStatus("idle");
  }, [initialMinutes]);

  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const toggle = useCallback(() => {
    setStatus((s) => (s === "running" ? "paused" : "running"));
  }, []);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setStatus("complete");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return { minutes, seconds, progress, status, start, pause, toggle, reset, remainingSeconds, totalSeconds };
}
