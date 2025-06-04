// frontend/src/contexts/SiteSettingsContext.js
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useSiteSettings as useSiteSettingsHook, useUpdateSiteSettings } from "../hooks";

/**
 * Site Settings Context
 *
 * This context manages site-wide settings including maintenance mode
 * and alert banners. It provides these settings to all components
 * and handles checking for maintenance mode.
 */
const SiteSettingsContext = createContext();

/**
 * Custom hook to use the site settings context
 */
export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider"
    );
  }
  return context;
};

/**
 * Site Settings Provider Component
 *
 * Wraps the application and provides site settings to all child components.
 * Automatically fetches settings on mount and periodically checks for updates.
 */
export const SiteSettingsProvider = ({ children }) => {
  // State for storing settings
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    maintenance_title: "Site Under Maintenance",
    maintenance_message:
      "We're currently performing scheduled maintenance. We'll be back online shortly.",
    maintenance_estimated_time: null,
    alert_enabled: false,
    alert_type: "info",
    alert_message: "",
    alert_dismissible: true,
    alert_link_text: null,
    alert_link_url: null,
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the site settings hooks
  const { data: settingsData, loading: settingsLoading, error: settingsError, refetch } = useSiteSettingsHook();
  const { mutate: updateSettingsMutation } = useUpdateSiteSettings({
    onSuccess: (response) => {
      if (response.success && response.data) {
        setSettings(response.data);
        // Reset alert dismissed state if alert content changed
        if (response.data.alert_message !== settings.alert_message) {
          setAlertDismissed(false);
        }
      }
    },
  });

  // Track if user has dismissed the alert
  const [alertDismissed, setAlertDismissed] = useState(false);
  
  // Update settings when data from hook changes
  useEffect(() => {
    if (settingsData?.success && settingsData.data) {
      setSettings(settingsData.data);
      // Check if alert has changed (reset dismissed state)
      if (settingsData.data.alert_message !== settings.alert_message) {
        setAlertDismissed(false);
      }
    }
  }, [settingsData]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update loading and error states
  useEffect(() => {
    setLoading(settingsLoading);
    setError(settingsError?.message || null);
  }, [settingsLoading, settingsError]);

  /**
   * Update site settings (admin only) (memoized)
   */
  const updateSettings = useCallback(async (newSettings) => {
    return new Promise((resolve, reject) => {
      updateSettingsMutation(newSettings, {
        onSuccess: (response) => {
          resolve({ success: true });
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  }, [updateSettingsMutation]);

  /**
   * Toggle maintenance mode (admin only) (memoized)
   */
  const toggleMaintenanceMode = useCallback(async () => {
    const newSettings = {
      ...settings,
      maintenance_mode: !settings.maintenance_mode,
    };
    return updateSettings(newSettings);
  }, [settings, updateSettings]);

  /**
   * Toggle alert banner (admin only) (memoized)
   */
  const toggleAlert = useCallback(async () => {
    const newSettings = {
      ...settings,
      alert_enabled: !settings.alert_enabled,
    };
    return updateSettings(newSettings);
  }, [settings, updateSettings]);

  /**
   * Dismiss the alert banner (user action) (memoized)
   */
  const dismissAlert = useCallback(() => {
    setAlertDismissed(true);
    // Optionally store in localStorage to persist across page refreshes
    localStorage.setItem("beekeeper_alert_dismissed", settings.alert_message);
  }, [settings.alert_message]);

  // Check for dismissed alert in localStorage on mount
  useEffect(() => {
    const dismissedMessage = localStorage.getItem("beekeeper_alert_dismissed");
    if (dismissedMessage === settings.alert_message) {
      setAlertDismissed(true);
    }
  }, [settings.alert_message]);

  // Set up periodic refetch for settings (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Check if alert should be shown (memoized)
  const shouldShowAlert = useMemo(() =>
    settings.alert_enabled && settings.alert_message && !alertDismissed,
    [settings.alert_enabled, settings.alert_message, alertDismissed]
  );

  const value = useMemo(() => ({
    settings,
    loading,
    error,
    shouldShowAlert,
    updateSettings,
    toggleMaintenanceMode,
    toggleAlert,
    dismissAlert,
    refreshSettings: refetch,
  }), [
    settings,
    loading,
    error,
    shouldShowAlert,
    updateSettings,
    toggleMaintenanceMode,
    toggleAlert,
    dismissAlert,
    refetch,
  ]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsContext;
