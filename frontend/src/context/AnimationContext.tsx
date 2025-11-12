import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AnimationOverlay from "../components/common/AnimationOverlay";
import type { AnimationType } from "../components/common/AnimationOverlay";

interface AnimationContextValue {
  showAnimation: (type: AnimationType, message?: string, timeoutMs?: number) => void;
  hideAnimation: () => void;
}

const AnimationContext = createContext<AnimationContextValue>({
  showAnimation: () => {},
  hideAnimation: () => {},
});

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<AnimationType>("loading");
  const [message, setMessage] = useState<string | undefined>(undefined);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const hideAnimation = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, []);

  const showAnimation = useCallback((t: AnimationType, msg?: string, timeoutMs?: number) => {
    clearTimer();
    setType(t);
    setMessage(msg);
    setVisible(true);

    // Auto-hide for success/error if timeout not provided
    const defaultTimeout = t === "loading" ? undefined : 2000;
    const ms = timeoutMs ?? defaultTimeout;
    if (ms && ms > 0) {
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, ms);
    }
  }, []);

  useEffect(() => () => clearTimer(), []);

  const value = useMemo(() => ({ showAnimation, hideAnimation }), [showAnimation, hideAnimation]);

  return (
    <AnimationContext.Provider value={value}>
      {children}
      {visible && <AnimationOverlay type={type} message={message} />}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => useContext(AnimationContext);
