// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import AdminDevtools from "./components/debug/AdminDevtools";
import "./index.scss";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";
import queryClient, { persistenceUtils } from "./lib/queryClient";
import { cacheWarmingManager, warmCache } from "./lib/cacheWarming";
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

// Initialize cache persistence and warming
const initializeCache = async () => {
  // Restore cache from localStorage
  persistenceUtils.restoreFromStorage();
  
  // Re-enable cache warming now that SCSS issue has been resolved
  await warmCache.onAppInit();
};

// Initialize cache asynchronously
initializeCache().catch(error => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Cache initialization failed:', error);
  }
});

// Add global debugging helpers for cache inspection
if (typeof window !== 'undefined') {
  window.debugCache = {
    getStats: () => {
      try {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        const articleQueries = queries.filter(q => q.queryKey[0] === 'articles');
        return {
          totalQueries: queries.length,
          articleQueries: articleQueries.length,
          freshQueries: queries.filter(q => !q.isStale()).length,
          staleQueries: queries.filter(q => q.isStale()).length,
          errorQueries: queries.filter(q => q.isError()).length,
          fetchingQueries: queries.filter(q => q.isFetching()).length,
          articleQueryDetails: articleQueries.map(q => ({
            key: q.queryKey,
            status: q.state.status,
            hasData: !!q.state.data,
            isStale: q.isStale()
          }))
        };
      } catch (error) {
        return { error: error.message };
      }
    },
    getAllQueries: () => {
      try {
        return queryClient.getQueryCache().getAll().map(q => ({
          queryKey: q.queryKey,
          state: q.state.status,
          dataUpdatedAt: q.state.dataUpdatedAt,
          isStale: q.isStale(),
        }));
      } catch (error) {
        return { error: error.message };
      }
    },
    clearCache: () => {
      try {
        queryClient.clear();
        return 'Cache cleared successfully';
      } catch (error) {
        return { error: error.message };
      }
    }
  };
  
  window.queryClient = queryClient;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Debug helpers available:');
    console.log('  window.debugCache.getStats() - Get cache statistics');
    console.log('  window.debugCache.getAllQueries() - List all cached queries');
    console.log('  window.debugCache.clearCache() - Clear all cache');
    console.log('  window.queryClient - Direct access to QueryClient');
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

// Conditionally disable StrictMode in development to prevent component double-mounting
// that interferes with image loading. StrictMode is automatically disabled in production.
const AppWrapper = ({ children }) => {
  // Disable StrictMode only if image loading issues are being debugged
  const shouldUseStrictMode = process.env.NODE_ENV === 'production' || 
                              !process.env.REACT_APP_DISABLE_STRICT_MODE;
  
  // Debug logging to confirm environment variables
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 StrictMode Configuration:');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  REACT_APP_DISABLE_STRICT_MODE:', process.env.REACT_APP_DISABLE_STRICT_MODE);
    console.log('  shouldUseStrictMode:', shouldUseStrictMode);
    console.log('  StrictMode enabled:', shouldUseStrictMode ? 'YES' : 'NO');
  }
  
  return shouldUseStrictMode ? (
    <React.StrictMode>{children}</React.StrictMode>
  ) : (
    <>{children}</>
  );
};

root.render(
  <AppWrapper>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SiteSettingsProvider>
              <App />
              <AdminDevtools />
            </SiteSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </AppWrapper>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
