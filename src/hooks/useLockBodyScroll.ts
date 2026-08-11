import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal or overlay menu is open.
 * Useful for mobile menus and bottom sheets to prevent background scrolling.
 */
export const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    // Save original overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';

    // Re-enable scrolling when component unmounts or isLocked becomes false
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};
