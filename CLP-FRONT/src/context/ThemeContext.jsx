"use client";

import { createContext, useState, useContext, useEffect } from "react";

// Create the context without TypeScript generics
const ThemeContext = createContext(undefined);

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isInitialized]);

  // Toggle light/dark theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
