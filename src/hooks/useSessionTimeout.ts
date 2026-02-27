import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 2 * 60 * 1000; // warn 2 min before

export function useSessionTimeout() {
  const { user, logout } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    if (!user) return;
    clearTimeout(timerRef.current);
    clearTimeout(warningRef.current);

    warningRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring",
        description: "You'll be logged out in 2 minutes due to inactivity.",
        variant: "destructive",
      });
    }, IDLE_TIMEOUT - WARNING_BEFORE);

    timerRef.current = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
      });
      logout();
    }, IDLE_TIMEOUT);
  }, [user, logout]);

  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    const handler = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimeout(timerRef.current);
      clearTimeout(warningRef.current);
    };
  }, [user, resetTimer]);
}
