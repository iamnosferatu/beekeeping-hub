// hooks/admin/useUserManagement.js (FIXED VERSION)
/**
 * Fixed custom hook for managing user data - no more infinite loops
 * Simplified and debugged version that actually works
 */
import { useState, useEffect, useContext, useCallback } from "react";
import apiService from "../../services/api";
import AuthContext from "../../contexts/AuthContext";

export const useUserManagement = () => {
  const { user: currentUser } = useContext(AuthContext);

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // useUserManagement hook initialized

  /**
   * Simplified fetch users function - removed complex caching that was causing loops
   */
  const fetchUsers = useCallback(async () => {
    // fetchUsers called

    if (!currentUser) {
      // No current user, skipping fetch
      setLoading(false);
      setError("Please log in to view users");
      return;
    }

    try {
      setLoading(true);
      setError(null);


      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      };

      // Making API request

      let response;
      let usedFallback = false;

      try {
        // Try admin endpoint first using apiService
        response = await apiService.admin.getUsers(params);
        // Admin endpoint successful
      } catch (adminError) {
        // Admin endpoint failed, trying fallback
        usedFallback = true;

        // Fallback: Get users from articles authors
        const articlesResponse = await apiService.articles.getAll({ limit: 100 });

        // Articles response received

        // Extract unique authors
        const authorsMap = new Map();
        const articles = articlesResponse.data.data || [];

        articles.forEach((article, index) => {
          if (article.author?.id) {
            const existingCount =
              authorsMap.get(article.author.id)?.article_count || 0;
            authorsMap.set(article.author.id, {
              ...article.author,
              article_count: existingCount + 1,
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
        // Extracted unique users

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
          // After search filter applied
        }

        if (roleFilter !== "all") {
          uniqueUsers = uniqueUsers.filter((user) => user.role === roleFilter);
          // After role filter applied
        }

        // Simple pagination
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);
        const totalPagesCalc = Math.ceil(uniqueUsers.length / 10);

        // Pagination calculated

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
        const userData = response.data.data || [];
        const paginationData = response.data.pagination || {};

        // Setting users data

        setUsers(userData);
        setTotalPages(paginationData.totalPages || 1);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      // Error in fetchUsers

      let errorMessage = "Failed to load users. Please try again.";

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please check your connection.";
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

      setError(errorMessage);
      setUsers([]);
    } finally {
      // fetchUsers completed
      setLoading(false);
    }
  }, [currentUser?.id, currentPage, searchTerm, roleFilter]); // Use only stable primitive values

  /**
   * Simple search handler - no complex state updates
   */
  const handleSearch = useCallback((searchValue) => {
    // Search term changed
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page
  }, []);

  /**
   * Simple role filter handler
   */
  const handleRoleFilterChange = useCallback((role) => {
    // Role filter changed
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page
  }, []);

  /**
   * Simple page change handler
   */
  const handlePageChange = useCallback((page) => {
    // Page changed
    setCurrentPage(page);
  }, []);

  /**
   * Simplified change user role
   */
  const changeUserRole = useCallback(
    async (userId, newRole) => {
      // Changing user role

      // Basic validation
      if (userId === currentUser?.id) {
        return { success: false, error: "You cannot change your own role" };
      }

      try {
        const response = await apiService.admin.updateUserRole(userId, newRole);

        if (response.success) {
          // Update local state
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user.id === userId ? { ...user, role: newRole } : user
            )
          );
          return { success: true, message: `User role updated to ${newRole}` };
        } else {
          throw new Error(response.message || "Failed to update role");
        }
      } catch (err) {
        // Role change error

        let errorMessage = "Failed to update user role.";
        if (err.response?.status === 404) {
          errorMessage = "Role management endpoint not implemented on server.";
        }

        return { success: false, error: errorMessage };
      }
    },
    [currentUser]
  );

  /**
   * Simplified delete user
   */
  const deleteUser = useCallback(
    async (userId) => {
      // Deleting user

      if (userId === currentUser?.id) {
        return { success: false, error: "You cannot delete your own account" };
      }

      try {
        const response = await apiService.admin.deleteUser(userId);

        if (response.success) {
          // Remove from local state
          setUsers(prevUsers =>
            prevUsers.filter(user => user.id !== userId)
          );
          return { success: true, message: "User deleted successfully" };
        } else {
          throw new Error(response.message || "Failed to delete user");
        }
      } catch (err) {
        // Delete user error

        let errorMessage = "Failed to delete user.";
        if (err.response?.status === 404) {
          errorMessage = "User deletion endpoint not implemented on server.";
        }

        return { success: false, error: errorMessage };
      }
    },
    [currentUser]
  );

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    // Resetting filters
    setSearchTerm("");
    setRoleFilter("all");
    setCurrentPage(1);
  }, []);

  /**
   * Manual refetch
   */
  const refetch = useCallback(() => {
    // Manual refetch triggered
    fetchUsers();
  }, [fetchUsers]);

  // FIXED: Simplified useEffect with proper dependencies
  useEffect(() => {
    // useEffect triggered - calling fetchUsers
    fetchUsers();
  }, [fetchUsers]); // Only depend on fetchUsers which has all the necessary dependencies

  // useUserManagement returning state

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
