import { useRef, useCallback } from 'react';

/**
 * Hook to differentiate between touch scroll and touch tap on mobile devices.
 * Prevents accidental clicks when scrolling.
 * 
 * @param onTap - Callback to execute when a tap is detected (not a scroll)
 * @param threshold - Movement threshold in pixels to consider it a scroll (default: 10)
 * @returns Object with touch event handlers
 */
export function useTouchHandler(
  onTap: () => void,
  threshold: number = 10
) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isTouchMoveRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isTouchMoveRef.current = false;
  }, []);

  const handleTouchMove = useCallback(() => {
    // Mark that user is scrolling
    isTouchMoveRef.current = true;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Consider it a tap if:
    // 1. User didn't trigger touchmove
    // 2. Movement is less than threshold
    // 3. Touch duration is less than 500ms (not a long press)
    const isTap = !isTouchMoveRef.current && 
                  deltaX < threshold && 
                  deltaY < threshold &&
                  deltaTime < 500;

    if (isTap) {
      e.preventDefault();
      e.stopPropagation();
      onTap();
    }

    // Reset
    touchStartRef.current = null;
    isTouchMoveRef.current = false;
  }, [onTap, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}

/**
 * Simpler version that just checks if touch moved during the gesture
 * Good for elements where you want to prevent click on scroll
 */
export function usePreventTouchScroll(onClick: () => void) {
  const touchMovedRef = useRef(false);

  const handleTouchStart = useCallback(() => {
    touchMovedRef.current = false;
  }, []);

  const handleTouchMove = useCallback(() => {
    touchMovedRef.current = true;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchMovedRef.current) {
      e.preventDefault();
      onClick();
    }
    touchMovedRef.current = false;
  }, [onClick]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}
