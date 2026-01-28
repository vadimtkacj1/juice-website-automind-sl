import { useEffect } from 'react';

/**
 * Optimized hook to lock body scroll when a modal/overlay is open
 * Prevents scroll jumps and janky behavior by using a smoother approach
 */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Store current scroll position
    const scrollY = window.scrollY;

    // Store original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalBodyTouchAction = document.body.style.touchAction;

    if (isIOS) {
      // iOS-specific: Use simple overflow hidden to avoid layout issues
      const html = document.documentElement;
      const originalHtmlOverflow = html.style.overflow;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      html.style.overflow = 'hidden';

      return () => {
        // Restore original styles
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
        html.style.overflow = originalHtmlOverflow;
      };
    } else {
      // Desktop/Android: Use fixed positioning to prevent scroll jumps
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Compensate for scrollbar width to prevent content shift
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        // Restore original styles FIRST
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;

        // THEN restore scroll position WITHOUT animation to prevent jumps
        window.scrollTo({
          top: scrollY,
          left: 0,
          behavior: 'instant' as ScrollBehavior
        });
      };
    }
  }, [isOpen]);
}

