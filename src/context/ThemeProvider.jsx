/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {}, setTheme: () => {} });

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("devtinder-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    localStorage.setItem("devtinder-theme", theme);
  }, [theme]);

  const setTheme = (next) => setThemeState(next === "light" ? "light" : "dark");
  const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
