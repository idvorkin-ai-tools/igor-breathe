import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWakeLock } from "./useWakeLock";

describe("useWakeLock", () => {
  const mockRelease = vi.fn();
  const mockWakeLock = {
    release: mockRelease,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any mocks
    vi.restoreAllMocks();
  });

  describe("when Wake Lock API is not supported", () => {
    it("should return isSupported as false", () => {
      // Ensure wakeLock is not in navigator
      const originalWakeLock = (navigator as any).wakeLock;
      delete (navigator as any).wakeLock;

      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.isActive).toBe(false);

      // Restore
      if (originalWakeLock) {
        (navigator as any).wakeLock = originalWakeLock;
      }
    });

    it("should return false when request is called", async () => {
      const originalWakeLock = (navigator as any).wakeLock;
      delete (navigator as any).wakeLock;

      const { result } = renderHook(() => useWakeLock());

      let requestResult: boolean;
      await act(async () => {
        requestResult = await result.current.request();
      });

      expect(requestResult!).toBe(false);

      if (originalWakeLock) {
        (navigator as any).wakeLock = originalWakeLock;
      }
    });
  });

  describe("when Wake Lock API is supported", () => {
    beforeEach(() => {
      (navigator as any).wakeLock = {
        request: vi.fn().mockResolvedValue(mockWakeLock),
      };
    });

    afterEach(() => {
      delete (navigator as any).wakeLock;
    });

    it("should return isSupported as true", () => {
      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isSupported).toBe(true);
    });

    it("should initialize with isActive as false", () => {
      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isActive).toBe(false);
    });

    it("should set isActive to true after successful request", async () => {
      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.request();
      });

      expect(result.current.isActive).toBe(true);
      expect((navigator as any).wakeLock.request).toHaveBeenCalledWith("screen");
    });

    it("should return true on successful request", async () => {
      const { result } = renderHook(() => useWakeLock());

      let requestResult: boolean;
      await act(async () => {
        requestResult = await result.current.request();
      });

      expect(requestResult!).toBe(true);
    });

    it("should handle request failure gracefully", async () => {
      (navigator as any).wakeLock.request = vi.fn().mockRejectedValue(new Error("Not allowed"));
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() => useWakeLock());

      let requestResult: boolean;
      await act(async () => {
        requestResult = await result.current.request();
      });

      expect(requestResult!).toBe(false);
      expect(result.current.isActive).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("should release wake lock", async () => {
      mockRelease.mockResolvedValue(undefined);
      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.request();
      });

      await act(async () => {
        await result.current.release();
      });

      expect(result.current.isActive).toBe(false);
      expect(mockRelease).toHaveBeenCalled();
    });

    it("should provide request and release functions", () => {
      const { result } = renderHook(() => useWakeLock());

      expect(typeof result.current.request).toBe("function");
      expect(typeof result.current.release).toBe("function");
    });
  });
});
