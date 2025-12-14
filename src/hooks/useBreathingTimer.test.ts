import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreathingTimer } from "./useBreathingTimer";

describe("useBreathingTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultPattern = {
    id: "test",
    name: "Test Pattern",
    type: "box" as const,
    durations: [4, 4, 4, 4],
  };

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useBreathingTimer({ pattern: defaultPattern })
    );

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentPhase).toBe(0);
    expect(result.current.phaseProgress).toBe(0);
    expect(result.current.cycle).toBe(1);
    expect(result.current.totalTime).toBe(0);
  });

  it("should start the timer", () => {
    const { result } = renderHook(() =>
      useBreathingTimer({ pattern: defaultPattern })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it("should stop the timer", () => {
    const { result } = renderHook(() =>
      useBreathingTimer({ pattern: defaultPattern })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.currentPhase).toBe(0);
    expect(result.current.cycle).toBe(1);
  });

  it("should pause and resume the timer", () => {
    const { result } = renderHook(() =>
      useBreathingTimer({ pattern: defaultPattern })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.togglePause();
    });

    expect(result.current.isPaused).toBe(false);
  });

  it("should call onPhaseChange when phase changes", () => {
    const onPhaseChange = vi.fn();

    const { result } = renderHook(() =>
      useBreathingTimer({ pattern: defaultPattern, onPhaseChange })
    );

    act(() => {
      result.current.start();
    });

    // Should be called with phase 0 on start
    expect(onPhaseChange).toHaveBeenCalledWith(0);

    // Advance time to complete first phase (4 seconds)
    act(() => {
      vi.advanceTimersByTime(4100);
    });

    // Should be called with phase 1
    expect(onPhaseChange).toHaveBeenCalledWith(1);
  });

  it("should expose durations from pattern", () => {
    const { result } = renderHook(() =>
      useBreathingTimer({ pattern: defaultPattern })
    );

    expect(result.current.durations).toEqual([4, 4, 4, 4]);
  });

  it("should handle patterns with zero-duration phases", () => {
    const patternWithZero = {
      id: "test",
      name: "4-7-8",
      type: "trapezoid" as const,
      durations: [4, 7, 8, 0],
    };

    const onPhaseChange = vi.fn();

    const { result } = renderHook(() =>
      useBreathingTimer({ pattern: patternWithZero, onPhaseChange })
    );

    act(() => {
      result.current.start();
    });

    // Advance through all phases
    act(() => {
      vi.advanceTimersByTime(4100); // Phase 0 complete
    });
    act(() => {
      vi.advanceTimersByTime(7100); // Phase 1 complete
    });
    act(() => {
      vi.advanceTimersByTime(8100); // Phase 2 complete
    });

    // Give time for zero-duration phase to be processed
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Phase 3 has 0 duration, should skip immediately to phase 0 of cycle 2
    expect(result.current.cycle).toBe(2);
    expect(result.current.currentPhase).toBe(0);
  });
});
