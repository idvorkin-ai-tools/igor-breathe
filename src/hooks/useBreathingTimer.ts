import { useState, useRef, useCallback, useEffect } from "react";

export interface BreathingPattern {
  id: string;
  name: string;
  type: "box" | "trapezoid";
  durations: number[];
  boxDuration?: number;
}

export interface BreathingTimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentPhase: number;
  phaseProgress: number;
  cycle: number;
  totalTime: number;
}

interface UseBreathingTimerOptions {
  pattern: BreathingPattern;
  onPhaseChange?: (phase: number) => void;
}

export function useBreathingTimer({ pattern, onPhaseChange }: UseBreathingTimerOptions) {
  const [state, setState] = useState<BreathingTimerState>({
    isRunning: false,
    isPaused: false,
    currentPhase: 0,
    phaseProgress: 0,
    cycle: 1,
    totalTime: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const phaseStartRef = useRef<number | null>(null);
  const lastPhaseRef = useRef(-1);

  const durations = pattern.durations;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setState({
      isRunning: false,
      isPaused: false,
      currentPhase: 0,
      phaseProgress: 0,
      cycle: 1,
      totalTime: 0,
    });
    lastPhaseRef.current = -1;
  }, [clearTimer]);

  const start = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    phaseStartRef.current = now;
    lastPhaseRef.current = -1;

    setState({
      isRunning: true,
      isPaused: false,
      currentPhase: 0,
      phaseProgress: 0,
      cycle: 1,
      totalTime: 0,
    });

    onPhaseChange?.(0);
    lastPhaseRef.current = 0;
  }, [onPhaseChange]);

  const togglePause = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused) {
        // Resuming - adjust phase start time
        phaseStartRef.current = Date.now() - prev.phaseProgress * durations[prev.currentPhase] * 1000;
      }
      return { ...prev, isPaused: !prev.isPaused };
    });
  }, [durations]);

  // Main timer loop
  useEffect(() => {
    if (!state.isRunning || state.isPaused) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - (phaseStartRef.current ?? now)) / 1000;
      const phaseDuration = durations[state.currentPhase];

      // Handle zero-duration phases (skip them)
      if (phaseDuration === 0) {
        phaseStartRef.current = now;
        const nextPhase = state.currentPhase === 3 ? 0 : state.currentPhase + 1;
        const newCycle = state.currentPhase === 3 ? state.cycle + 1 : state.cycle;

        if (lastPhaseRef.current !== nextPhase) {
          onPhaseChange?.(nextPhase);
          lastPhaseRef.current = nextPhase;
        }

        setState((prev) => ({
          ...prev,
          currentPhase: nextPhase,
          cycle: newCycle,
          phaseProgress: 0,
        }));
        return;
      }

      const progress = Math.min(elapsed / phaseDuration, 1);
      const totalTime = Math.floor((now - (startTimeRef.current ?? now)) / 1000);

      if (progress >= 1) {
        // Phase complete
        phaseStartRef.current = now;
        const nextPhase = state.currentPhase === 3 ? 0 : state.currentPhase + 1;
        const newCycle = state.currentPhase === 3 ? state.cycle + 1 : state.cycle;

        if (lastPhaseRef.current !== nextPhase) {
          onPhaseChange?.(nextPhase);
          lastPhaseRef.current = nextPhase;
        }

        setState((prev) => ({
          ...prev,
          currentPhase: nextPhase,
          cycle: newCycle,
          phaseProgress: 0,
          totalTime,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          phaseProgress: progress,
          totalTime,
        }));
      }
    }, 50);

    return clearTimer;
  }, [state.isRunning, state.isPaused, state.currentPhase, state.cycle, durations, onPhaseChange, clearTimer]);

  return {
    ...state,
    durations,
    start,
    stop,
    togglePause,
  };
}
