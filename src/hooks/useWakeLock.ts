import { useEffect, useRef, useState } from "react";

/**
 * Hook to keep the screen awake during breathing sessions
 * Uses the Screen Wake Lock API when available
 */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [isSupported] = useState(() => "wakeLock" in navigator);
  const [isActive, setIsActive] = useState(false);

  const request = async () => {
    if (!isSupported) return false;

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      setIsActive(true);

      wakeLockRef.current.addEventListener("release", () => {
        setIsActive(false);
      });

      return true;
    } catch (err) {
      console.warn("Wake Lock request failed:", err);
      return false;
    }
  };

  const release = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
      } catch (err) {
        console.warn("Wake Lock release failed:", err);
      }
    }
  };

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isActive && !wakeLockRef.current) {
        await request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      release();
    };
  }, []);

  return { isSupported, isActive, request, release };
}
