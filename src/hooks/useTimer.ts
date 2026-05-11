import { useState, useEffect, useCallback, useRef } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "complete";

export function useTimer(initialMinutes: number) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endAtRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!endAtRef.current) return;
    const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    setRemainingSeconds(next);
    if (next <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      endAtRef.current = null;
      setStatus("complete");
    }
  }, []);

  const reset = useCallback((newMinutes?: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    endAtRef.current = null;
    const secs = Math.max(1, Math.round((newMinutes ?? initialMinutes) * 60));
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setStatus("idle");
  }, [initialMinutes]);

  const start = useCallback((newMinutes?: number) => {
    const secs = newMinutes !== undefined ? Math.max(1, Math.round(newMinutes * 60)) : remainingSeconds;
    if (newMinutes !== undefined) {
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
    }
    endAtRef.current = Date.now() + secs * 1000;
    setStatus("running");
  }, [remainingSeconds]);

  const pause = useCallback(() => {
    tick();
    endAtRef.current = null;
    setStatus("paused");
  }, [tick]);

  const toggle = useCallback(() => {
    setStatus((s) => (s === "running" ? "paused" : "running"));
  }, []);

  useEffect(() => {
    if (status === "running") {
      tick();
      intervalRef.current = setInterval(tick, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [status, tick]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && status === "running") tick();
    };
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [status, tick]);

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return { minutes, seconds, progress, status, start, pause, toggle, reset, remainingSeconds, totalSeconds };
}
