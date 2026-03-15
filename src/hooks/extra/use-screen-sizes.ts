import { useEffect, useState } from "react";

type ScreenSizes = {
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
};

const breakpoints = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const useScreenSizes = (): ScreenSizes => {
  const getSizes = (): ScreenSizes => ({
    isXs: window.innerWidth < breakpoints.sm,
    isSm: window.innerWidth >= breakpoints.sm,
    isMd: window.innerWidth >= breakpoints.md,
    isLg: window.innerWidth >= breakpoints.lg,
    isXl: window.innerWidth >= breakpoints.xl,
  });

  const [sizes, setSizes] = useState<ScreenSizes>(() =>
    typeof window !== "undefined"
      ? getSizes()
      : {
          isXs: false,
          isSm: false,
          isMd: false,
          isLg: false,
          isXl: false,
        }
  );

  useEffect(() => {
    const handleResize = () => {
      setSizes(getSizes());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return sizes;
};