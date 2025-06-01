// frontend/src/contexts/SiteSettingsContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "../config";

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

  // Track if user has dismissed the alert
  const [alertDismissed, setAlertDismissed] = useState(false);

  /**
   * Fetch site settings from the API
   */
  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/site-settings`);

      if (response.data.success) {
        setSettings(response.data.data);

        // Check if alert has changed (reset dismissed state)
        if (response.data.data.alert_message !== settings.alert_message) {
          setAlertDismissed(false);
        }
      }
    } catch (err) {
      // Error fetching site settings
      setError("Failed to load site settings");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update site settings (admin only)
   */
  const updateSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.put(
        `${API_URL}/site-settings`,
        newSettings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSettings(response.data.data);
        // Reset alert dismissed state if alert content changed
        if (newSettings.alert_message !== undefined) {
          setAlertDismissed(false);
        }
        return { success: true };
      }
    } catch (err) {
      // Error updating site settings
      return {
        success: false,
        error: err.response?.data?.message || "Failed to update settings",
      };
    }
  };

  /**
   * Toggle maintenance mode (admin only)
   */
  const toggleMaintenanceMode = async () => {
    try {
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.post(
        `${API_URL}/site-settings/maintenance/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          maintenance_mode: response.data.data.maintenance_mode,
        }));
        return { success: true };
      }
    } catch (err) {
      // Error toggling maintenance mode
      return {
        success: false,
        error:
          err.response?.data?.message || "Failed to toggle maintenance mode",
      };
    }
  };

  /**
   * Toggle alert banner (admin only)
   */
  const toggleAlert = async () => {
    try {
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.post(
        `${API_URL}/site-settings/alert/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          alert_enabled: response.data.data.alert_enabled,
        }));
        // Reset dismissed state when toggling on
        if (response.data.data.alert_enabled) {
          setAlertDismissed(false);
        }
        return { success: true };
      }
    } catch (err) {
      // Error toggling alert
      return {
        success: false,
        error: err.response?.data?.message || "Failed to toggle alert",
      };
    }
  };

  /**
   * Dismiss the alert banner (user action)
   */
  const dismissAlert = () => {
    setAlertDismissed(true);
    // Optionally store in localStorage to persist across page refreshes
    localStorage.setItem("beekeeper_alert_dismissed", settings.alert_message);
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();

    // Check for dismissed alert in localStorage
    const dismissedMessage = localStorage.getItem("beekeeper_alert_dismissed");
    if (dismissedMessage === settings.alert_message) {
      setAlertDismissed(true);
    }

    // Set up periodic checks for maintenance mode (every 5 minutes)
    const interval = setInterval(fetchSettings, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if alert should be shown
  const shouldShowAlert =
    settings.alert_enabled && settings.alert_message && !alertDismissed;

  const value = {
    settings,
    loading,
    error,
    shouldShowAlert,
    updateSettings,
    toggleMaintenanceMode,
    toggleAlert,
    dismissAlert,
    refreshSettings: fetchSettings,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsContext;
