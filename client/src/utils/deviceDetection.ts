/**
 * Device and environment detection utilities
 */

/**
 * Detects if the app is running in Electron
 */
export function isElectron(): boolean {
  // Check if running in Electron environment
  return !!(
    typeof window !== "undefined" &&
    window.navigator &&
    window.navigator.userAgent &&
    window.navigator.userAgent.toLowerCase().includes("electron")
  );
}

/**
 * Detects if the device has a physical keyboard
 * Returns false for mobile/tablet devices
 */
export function hasPhysicalKeyboard(): boolean {
  // Check if it's a mobile or tablet device
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );

  // Mobile devices typically don't need on-screen keyboard
  if (isMobile) {
    return true; // Has virtual keyboard, don't show our on-screen keyboard
  }

  // Check for touch support (tablets/touchscreen laptops)
  const hasTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - msMaxTouchPoints is IE specific
    navigator.msMaxTouchPoints > 0;

  // If it's a desktop with touch (like Surface), check screen size
  if (hasTouch) {
    const isLargeScreen = window.innerWidth >= 1024;
    // Large touchscreen = probably a kiosk/POS
    return !isLargeScreen;
  }

  // Regular desktop/laptop
  return true;
}

/**
 * Determines if on-screen keyboard should be shown
 * Returns true for POS/kiosk environments (Electron or large touchscreens)
 */
export function shouldShowOnScreenKeyboard(): boolean {
  // Always show in Electron (POS app)
  if (isElectron()) {
    return true;
  }

  // Check if it's a mobile device
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );

  // Don't show on mobile - they have native keyboards
  if (isMobile) {
    return false;
  }

  // Check for touch support
  const hasTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0;

  // Show on large touchscreens (kiosks/POS terminals)
  if (hasTouch) {
    const isLargeScreen = window.innerWidth >= 1024;
    return isLargeScreen;
  }

  // Don't show on regular desktop browsers
  return false;
}

/**
 * Gets the environment type
 */
export function getEnvironmentType():
  | "electron"
  | "mobile"
  | "kiosk"
  | "desktop" {
  if (isElectron()) {
    return "electron";
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );

  if (isMobile) {
    return "mobile";
  }

  const hasTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0;

  if (hasTouch && window.innerWidth >= 1024) {
    return "kiosk";
  }

  return "desktop";
}
