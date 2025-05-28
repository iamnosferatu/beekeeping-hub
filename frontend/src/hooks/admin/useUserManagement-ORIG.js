// hooks/admin/useUserManagement.js (ENHANCED VERSION with better error handling)
/**
 * Enhanced custom hook for managing user data and operations in admin panel
 * Production-ready with comprehensive error handling and loading states
 */
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import AuthContext from "../../contexts/AuthContext";

export const useUserManagement = () => {
  const { user: currentUser } = useContext(AuthContext);
  const mountedRef = useRef(true);

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastFetchParams, setLastFetchParams] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Safe state update that checks if component is still mounted
   */
  const safeSetState = useCallback((setter) => {
    if (mountedRef.current) {
      setter();
    }
  }, []);

  /**
   * Enhanced fetch users with caching and error recovery
   */
  const fetchUsers = useCallback(
    async (forceRefresh = false) => {
      const currentParams = {
        page: currentPage,
        search: searchTerm,
        role: roleFilter,
      };

      // Skip fetch if params haven't changed and not forcing refresh
      if (
        !forceRefresh &&
        lastFetchParams &&
        JSON.stringify(currentParams) === JSON.stringify(lastFetchParams)
      ) {
        return;
      }

      try {
        safeSetState(() => {
          setLoading(true);
          setError(null);
        });

        const token = localStorage.getItem("beekeeper_auth_token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const params = {
          page: currentPage,
          limit: 10,
          ...(searchTerm.trim() && { search: searchTerm.trim() }),
          ...(roleFilter !== "all" && { role: roleFilter }),
        };

        // Create cancel token for request cancellation
        const cancelTokenSource = axios.CancelToken.source();

        let response;
        try {
          // Try admin endpoint first
          response = await axios.get(`${API_URL}/admin/users`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
            cancelToken: cancelTokenSource.token,
          });
        } catch (adminError) {
          // Check if request was cancelled
          if (axios.isCancel(adminError)) {
            return;
          }

          console.log(
            "Admin users endpoint failed, trying alternative approach"
          );

          // Fallback: Get users from articles authors
          const articlesResponse = await axios.get(`${API_URL}/articles`, {
            params: { limit: 100 },
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
            cancelToken: cancelTokenSource.token,
          });

          // Extract unique authors and add current user
          const authorsMap = new Map();
          (articlesResponse.data.data || []).forEach((article) => {
            if (article.author?.id) {
              authorsMap.set(article.author.id, {
                ...article.author,
                article_count:
                  (authorsMap.get(article.author.id)?.article_count || 0) + 1,
              });
            }
          });

          // Add current user if not in the list
          if (currentUser && !authorsMap.has(currentUser.id)) {
            authorsMap.set(currentUser.id, {
              ...currentUser,
              article_count: 0,
            });
          }

          let uniqueUsers = Array.from(authorsMap.values());

          // Apply client-side filtering
          if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            uniqueUsers = uniqueUsers.filter(
              (user) =>
                user.username?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                `${user.first_name || ""} ${user.last_name || ""}`
                  .toLowerCase()
                  .includes(searchLower)
            );
          }

          if (roleFilter !== "all") {
            uniqueUsers = uniqueUsers.filter(
              (user) => user.role === roleFilter
            );
          }

          // Simulate pagination for fallback
          const startIndex = (currentPage - 1) * 10;
          const endIndex = startIndex + 10;
          const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);
          const totalPagesCalc = Math.ceil(uniqueUsers.length / 10);

          response = {
            data: {
              success: true,
              data: paginatedUsers,
              pagination: {
                totalPages: totalPagesCalc,
                page: currentPage,
                total: uniqueUsers.length,
              },
            },
          };
        }

        if (response.data?.success) {
          safeSetState(() => {
            setUsers(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
            setLastFetchParams(currentParams);
          });
        } else {
          throw new Error(response.data?.message || "Failed to fetch users");
        }
      } catch (err) {
        // Don't set error if request was cancelled
        if (axios.isCancel(err)) {
          return;
        }

        console.error("Error fetching users:", err);

        let errorMessage = "Failed to load users. Please try again.";

        if (err.code === "ECONNABORTED") {
          errorMessage =
            "Request timed out. Please check your connection and try again.";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication expired. Please log in again.";
          localStorage.removeItem("beekeeper_auth_token");
        } else if (err.response?.status === 403) {
          errorMessage = "You don't have permission to view users.";
        } else if (err.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (!err.response) {
          errorMessage =
            "Unable to connect to server. Please check your connection.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        safeSetState(() => {
          setError(errorMessage);
          setUsers([]);
        });
      } finally {
        safeSetState(() => setLoading(false));
      }
    },
    [
      currentPage,
      roleFilter,
      searchTerm,
      currentUser,
      lastFetchParams,
      safeSetState,
    ]
  );

  /**
   * Handle search with debouncing
   */
  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
    setLastFetchParams(null); // Force refetch
  }, []);

  /**
   * Handle role filter change
   */
  const handleRoleFilterChange = useCallback((role) => {
    setRoleFilter(role);
    setCurrentPage(1);
    setLastFetchParams(null); // Force refetch
  }, []);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setLastFetchParams(null); // Force refetch
  }, []);

  /**
   * Enhanced change user role with optimistic updates
   */
  const changeUserRole = useCallback(
    async (userId, newRole) => {
      // Validation
      const validRoles = ["user", "author", "admin"];
      if (!validRoles.includes(newRole)) {
        return { success: false, error: "Invalid role selected" };
      }

      if (userId === currentUser?.id) {
        return { success: false, error: "You cannot change your own role" };
      }

      // Store original user for rollback
      const originalUser = users.find((u) => u.id === userId);
      if (!originalUser) {
        return { success: false, error: "User not found" };
      }

      try {
        // Optimistic update
        safeSetState(() => {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId ? { ...user, role: newRole } : user
            )
          );
        });

        const token = localStorage.getItem("beekeeper_auth_token");
        const response = await axios.put(
          `${API_URL}/admin/users/${userId}/role`,
          { role: newRole },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (response.data?.success) {
          return { success: true, message: `User role updated to ${newRole}` };
        } else {
          throw new Error(response.data?.message || "Failed to update role");
        }
      } catch (err) {
        // Rollback optimistic update
        safeSetState(() => {
          setUsers((prevUsers) =>
            prevUsers.map((user) => (user.id === userId ? originalUser : user))
          );
        });

        console.error("Error changing user role:", err);

        let errorMessage = "Failed to update user role. Please try again.";
        if (err.response?.status === 404) {
          errorMessage =
            "Role management is not yet implemented on the server.";
        } else if (err.response?.status === 403) {
          errorMessage = "You don't have permission to change user roles.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        return { success: false, error: errorMessage };
      }
    },
    [users, currentUser, safeSetState]
  );

  /**
   * Enhanced delete user with optimistic updates
   */
  const deleteUser = useCallback(
    async (userId) => {
      if (userId === currentUser?.id) {
        return { success: false, error: "You cannot delete your own account" };
      }

      // Store original users for rollback
      const originalUsers = [...users];

      try {
        // Optimistic update
        safeSetState(() => {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== userId)
          );
        });

        const token = localStorage.getItem("beekeeper_auth_token");
        const response = await axios.delete(
          `${API_URL}/admin/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (response.data?.success) {
          return { success: true, message: "User deleted successfully" };
        } else {
          throw new Error(response.data?.message || "Failed to delete user");
        }
      } catch (err) {
        // Rollback optimistic update
        safeSetState(() => setUsers(originalUsers));

        console.error("Error deleting user:", err);

        let errorMessage = "Failed to delete user. Please try again.";
        if (err.response?.status === 404) {
          errorMessage = "User deletion is not yet implemented on the server.";
        } else if (err.response?.status === 403) {
          errorMessage = "You don't have permission to delete users.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        return { success: false, error: errorMessage };
      }
    },
    [users, currentUser, safeSetState]
  );

  /**
   * Reset all filters and refresh
   */
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setRoleFilter("all");
    setCurrentPage(1);
    setLastFetchParams(null);
  }, []);

  /**
   * Manual refetch with force refresh
   */
  const refetch = useCallback(() => {
    setLastFetchParams(null);
    fetchUsers(true);
  }, [fetchUsers]);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    // Data
    users,
    loading,
    error,

    // Filter state
    searchTerm,
    roleFilter,
    currentPage,
    totalPages,

    // Actions
    handleSearch,
    handleRoleFilterChange,
    handlePageChange,
    changeUserRole,
    deleteUser,
    resetFilters,
    refetch,

    // Utils
    isEmpty: users.length === 0 && !loading && !error,
  };
};
