/**
 * Responsive utilities for handling different screen sizes
 */

import { useEffect, useState } from "react";

// Breakpoints matching tailwind config
export const breakpoints = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Hook to detect current screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        height: window.innerHeight,
      });

      // Update device type
      if (width < breakpoints.sm) {
        setDeviceType("mobile");
      } else if (width < breakpoints.lg) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    // Set initial values
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
    deviceType,
  };
};

// Helper to conditionally apply classes based on screen size
export const getResponsiveClasses = (
  baseClasses: string,
  mobileClasses: string,
  tabletClasses: string,
  desktopClasses: string
) => {
  return `${baseClasses} 
    ${mobileClasses} 
    sm:${tabletClasses} 
    lg:${desktopClasses}`;
};
