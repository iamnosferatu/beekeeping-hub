// frontend/src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";

// Available themes
const themes = {
/*   default: {
    name: "Default",
    primaryColor: "#ffc107", // Honey yellow
    secondaryColor: "#6c757d",
    bgColor: "#ffffff",
    textColor: "#212529",
    linkColor: "#007bff",
    fontFamily: "'Open Sans', sans-serif",
    borderRadius: "0.375rem",
    boxShadow: "0 .5rem 1rem rgba(0,0,0,.15)",
    navbarBg: "#ffc107",
    navbarText: "#212529",
    footerBg: "#f8f9fa",
    footerText: "#6c757d",
  }, */
  dark: {
    name: "Dark",
    primaryColor: "#ffc107", // Honey yellow
    secondaryColor: "#6c757d",
    bgColor: "#212529",
    textColor: "#f8f9fa",
    linkColor: "#ffc107",
    fontFamily: "'Open Sans', sans-serif",
    borderRadius: "0.375rem",
    boxShadow: "0 .5rem 1rem rgba(255,255,255,.1)",
    navbarBg: "#343a40",
    navbarText: "#f8f9fa",
    footerBg: "#343a40",
    footerText: "#f8f9fa",
  },
  nature: {
    name: "Nature",
    primaryColor: "#ffc107", // Honey yellow
    secondaryColor: "#28a745", // Green
    bgColor: "#f8f9fa",
    textColor: "#212529",
    linkColor: "#28a745",
    fontFamily: "'Montserrat', sans-serif",
    borderRadius: "0.5rem",
    boxShadow: "0 .5rem 1rem rgba(40,167,69,.15)",
    navbarBg: "#28a745",
    navbarText: "#ffffff",
    footerBg: "#28a745",
    footerText: "#ffffff",
  },
/*   elegant: {
    name: "Elegant",
    primaryColor: "#d4af37", // Gold
    secondaryColor: "#343a40",
    bgColor: "#ffffff",
    textColor: "#343a40",
    linkColor: "#d4af37",
    fontFamily: "'Playfair Display', serif",
    borderRadius: "0.25rem",
    boxShadow: "0 .5rem 1rem rgba(0,0,0,.1)",
    navbarBg: "#343a40",
    navbarText: "#d4af37",
    footerBg: "#343a40",
    footerText: "#d4af37",
  }, */
};

// Create context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Get theme from localStorage or use default
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "default"
  );

  // Apply theme to document
  useEffect(() => {
    const theme = themes[currentTheme] || themes.default;

    // Save theme to localStorage
    localStorage.setItem("theme", currentTheme);

    // Apply theme variables to document root (as CSS variables)
    const root = document.documentElement;
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--secondary-color", theme.secondaryColor);
    root.style.setProperty("--bg-color", theme.bgColor);
    root.style.setProperty("--text-color", theme.textColor);
    root.style.setProperty("--link-color", theme.linkColor);
    root.style.setProperty("--font-family", theme.fontFamily);
    root.style.setProperty("--border-radius", theme.borderRadius);
    root.style.setProperty("--box-shadow", theme.boxShadow);
    root.style.setProperty("--navbar-bg", theme.navbarBg);
    root.style.setProperty("--navbar-text", theme.navbarText);
    root.style.setProperty("--footer-bg", theme.footerBg);
    root.style.setProperty("--footer-text", theme.footerText);

    // Add/remove dark class on body for Bootstrap dark mode
    if (currentTheme === "dark") {
      document.body.setAttribute("data-bs-theme", "dark");
    } else {
      document.body.setAttribute("data-bs-theme", "light");
    }

    // Load appropriate Google Fonts based on theme
    const fontLink = document.getElementById("theme-font");
    if (!fontLink) {
      const link = document.createElement("link");
      link.id = "theme-font";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    // Set appropriate font URL
    const fontLink2 = document.getElementById("theme-font");
    if (currentTheme === "elegant") {
      fontLink2.href =
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap";
    } else if (currentTheme === "nature") {
      fontLink2.href =
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
    } else {
      fontLink2.href =
        "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap";
    }
  }, [currentTheme]);

  // Change theme
  const changeTheme = (theme) => {
    if (themes[theme]) {
      setCurrentTheme(theme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        changeTheme,
        themeConfig: themes[currentTheme] || themes.default,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
