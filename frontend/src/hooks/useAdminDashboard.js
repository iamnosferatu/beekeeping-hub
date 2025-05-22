// frontend/src/hooks/useAdminDashboard.js - REAL API VERSION
import { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";

export const useAdminDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [data, setData] = useState({
    stats: null,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch if user is admin
      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized access");
      }

      console.log("Fetching admin dashboard data...");

      // Fetch dashboard statistics
      const statsResponse = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!statsResponse.data.success) {
        throw new Error(
          statsResponse.data.message || "Failed to fetch dashboard data"
        );
      }

      console.log("Dashboard stats received:", statsResponse.data.data);

      // You could also fetch recent activity here if you have an endpoint for it
      // const activityResponse = await axios.get(`${API_URL}/admin/recent-activity`);

      setData({
        stats: statsResponse.data.data,
        recentActivity: [], // Would be populated from API in future
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [user, token]); // Dependencies for useCallback

  // Fetch data on mount and when user/token changes
  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, token, fetchDashboardData]);

  // Return data and actions
  return {
    ...data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};

export default useAdminDashboard;
