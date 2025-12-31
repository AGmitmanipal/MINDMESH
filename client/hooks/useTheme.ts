import { useEffect, useState } from "react";

type Theme = "light" | "dark";

// Apply theme immediately (before React hydration)
function getInitialTheme(): Theme {
  // Check localStorage first
  const saved = localStorage.getItem("cortex-theme") as Theme | null;
  if (saved) {
    // Apply immediately
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return saved;
  }
  
  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
    return "dark";
  }
  
  document.documentElement.classList.remove("dark");
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("cortex-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}

