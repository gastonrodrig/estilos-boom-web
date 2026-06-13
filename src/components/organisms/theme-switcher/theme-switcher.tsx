"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeSwitcherProps {
  className?: string;
  iconClassName?: string;
}

export function ThemeSwitcher({ className, iconClassName }: ThemeSwitcherProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className || "w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse"} />;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className || "p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none"}
      title="Cambiar tema"
    >
      {isDark ? (
        <Sun className={`${iconClassName || "w-5 h-5"} text-[#b8860b] transition-transform duration-300 hover:rotate-[20deg]`} />
      ) : (
        <Moon className={`${iconClassName || "w-5 h-5"} text-[#b8860b] transition-transform duration-300 hover:rotate-[20deg]`} />
      )}
    </button>
  );
}
