// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.scss";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";
import reportWebVitals from "./reportWebVitals";

// Global error handlers for unhandled errors
const handleGlobalError = (event) => {
  const errorInfo = {
    message: event.error?.message || event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Global Error Handler');
    console.error('Unhandled Error:', event.error || event);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
  }

  // Store for debugging
  try {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push({ type: 'global', ...errorInfo });
    localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10)));
  } catch (e) {
    // Silently fail
  }

  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorInfo),
    // }).catch(() => {});
  }
};

const handleUnhandledRejection = (event) => {
  const errorInfo = {
    reason: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Unhandled Promise Rejection');
    console.error('Reason:', event.reason);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
  }

  // Store for debugging
  try {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push({ type: 'promise_rejection', ...errorInfo });
    localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10)));
  } catch (e) {
    // Silently fail
  }

  // Prevent default browser error handling
  event.preventDefault();
};

// Set up global error handlers
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <App />
          </SiteSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
