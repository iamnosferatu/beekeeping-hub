// frontend/src/contexts/SiteSettingsContext.js
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useSiteSettings as useSiteSettingsHook, useUpdateSiteSettings, useFeatureStatus } from "../hooks";

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
    forum_enabled: false, // Default to false
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the site settings hooks
  const { data: settingsData, loading: settingsLoading, error: settingsError, refetch } = useSiteSettingsHook();
  
  // Check forum feature status
  const { data: forumFeatureData, loading: forumLoading } = useFeatureStatus('forum');
  const { mutate: updateSettingsMutation } = useUpdateSiteSettings({
    onSuccess: (response) => {
      // The response here is the full backend response with success, message, and data
      if (response && response.data) {
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
      const newSettings = { ...settingsData.data };
      
      // Add forum_enabled from feature flag
      if (forumFeatureData?.success && forumFeatureData.data) {
        newSettings.forum_enabled = forumFeatureData.data.enabled;
      }
      
      setSettings(newSettings);
      // Check if alert has changed (reset dismissed state)
      if (newSettings.alert_message !== settings.alert_message) {
        setAlertDismissed(false);
      }
    }
  }, [settingsData, forumFeatureData]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update forum_enabled when feature data changes
  useEffect(() => {
    if (forumFeatureData?.success && forumFeatureData.data) {
      setSettings(prev => ({
        ...prev,
        forum_enabled: forumFeatureData.data.enabled
      }));
    }
  }, [forumFeatureData]);
  
  // Update loading and error states
  useEffect(() => {
    setLoading(settingsLoading || forumLoading);
    setError(settingsError?.message || null);
  }, [settingsLoading, settingsError, forumLoading]);

  /**
   * Update site settings (admin only) (memoized)
   */
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const result = await updateSettingsMutation(newSettings);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to update settings' 
      };
    }
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
