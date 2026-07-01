"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

interface ThemeSnapshot {
  theme: Theme;
  resolvedTheme: "light" | "dark";
}

const STORAGE_KEY = "dayflow-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const themeListeners = new Set<() => void>();

const SERVER_THEME_SNAPSHOT: ThemeSnapshot = {
  theme: "system",
  resolvedTheme: "light",
};

let hasHydratedTheme = false;
let cachedThemeSnapshot: ThemeSnapshot = SERVER_THEME_SNAPSHOT;
let cachedStoredTheme: Theme | null = "system";

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
}

function resolveTheme(theme: Theme) {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}

function commitThemeSnapshot(theme: Theme, resolvedTheme: "light" | "dark") {
  if (
    cachedThemeSnapshot.theme === theme &&
    cachedThemeSnapshot.resolvedTheme === resolvedTheme
  ) {
    return false;
  }

  cachedThemeSnapshot = { theme, resolvedTheme };
  return true;
}

function refreshThemeSnapshotFromStorage() {
  const storedTheme = readStoredTheme();

  if (hasHydratedTheme && storedTheme === cachedStoredTheme) {
    return cachedThemeSnapshot;
  }

  cachedStoredTheme = storedTheme;
  const resolvedTheme = resolveTheme(storedTheme);
  commitThemeSnapshot(storedTheme, resolvedTheme);
  return cachedThemeSnapshot;
}

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function getThemeSnapshot() {
  if (typeof window !== "undefined" && !hasHydratedTheme) {
    return SERVER_THEME_SNAPSHOT;
  }

  return refreshThemeSnapshotFromStorage();
}

function getServerThemeSnapshot() {
  return SERVER_THEME_SNAPSHOT;
}

function hydrateTheme() {
  if (typeof window === "undefined" || hasHydratedTheme) {
    return;
  }

  hasHydratedTheme = true;
  const snapshot = refreshThemeSnapshotFromStorage();
  applyTheme(snapshot.theme);
  notifyThemeListeners();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    hydrateTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange() {
      if (readStoredTheme() !== "system") {
        return;
      }

      const resolvedTheme = applyTheme("system");
      const changed = commitThemeSnapshot("system", resolvedTheme);

      if (changed) {
        notifyThemeListeners();
      }
    }

    media.addEventListener("change", handleSystemThemeChange);
    return () => media.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    cachedStoredTheme = next;
    const resolvedTheme = applyTheme(next);

    if (commitThemeSnapshot(next, resolvedTheme)) {
      notifyThemeListeners();
    }
  }, []);

  const value = useMemo(
    () => ({
      theme: snapshot.theme,
      resolvedTheme: snapshot.resolvedTheme,
      setTheme,
    }),
    [setTheme, snapshot.resolvedTheme, snapshot.theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
