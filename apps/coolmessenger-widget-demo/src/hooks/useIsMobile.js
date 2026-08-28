import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

// Drives the App-level switch between the desktop window-manager UI and
// MobileShell. Re-evaluates on resize so rotating a phone or resizing a
// browser window across the breakpoint updates live.
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
