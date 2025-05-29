// hooks/admin/useUserManagement.js (FIXED VERSION)
/**
 * Fixed custom hook for managing user data - no more infinite loops
 * Simplified and debugged version that actually works
 */
import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../config";
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

  console.log("🔄 useUserManagement hook called", {
    currentPage,
    searchTerm,
    roleFilter,
    usersCount: users.length,
    loading,
    error: error?.slice(0, 50),
  });

  /**
   * Simplified fetch users function - removed complex caching that was causing loops
   */
  const fetchUsers = useCallback(async () => {
    console.log("🚀 fetchUsers called", {
      currentPage,
      searchTerm,
      roleFilter,
    });

    if (!currentUser) {
      console.log("❌ No current user, skipping fetch");
      setLoading(false);
      setError("Please log in to view users");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("beekeeper_auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      };

      console.log("📡 Making API request with params:", params);

      let response;
      let usedFallback = false;

      try {
        // Try admin endpoint first
        console.log("🔄 Trying admin endpoint...");
        response = await axios.get(`${API_URL}/admin/users`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        console.log("✅ Admin endpoint successful:", response.data);
      } catch (adminError) {
        console.log("❌ Admin endpoint failed:", adminError.message);
        console.log("🔄 Trying fallback approach...");
        usedFallback = true;

        // Fallback: Get users from articles authors
        const articlesResponse = await axios.get(`${API_URL}/articles`, {
          params: { limit: 100 },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });

        console.log("📊 Articles response:", {
          success: articlesResponse.data.success,
          articlesCount: articlesResponse.data.data?.length || 0,
        });

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
        console.log("👥 Extracted unique users:", uniqueUsers.length);

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
          console.log("🔍 After search filter:", uniqueUsers.length);
        }

        if (roleFilter !== "all") {
          uniqueUsers = uniqueUsers.filter((user) => user.role === roleFilter);
          console.log("🎭 After role filter:", uniqueUsers.length);
        }

        // Simple pagination
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);
        const totalPagesCalc = Math.ceil(uniqueUsers.length / 10);

        console.log("📄 Pagination:", {
          totalUsers: uniqueUsers.length,
          currentPage,
          totalPages: totalPagesCalc,
          showingUsers: paginatedUsers.length,
        });

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

        console.log("✅ Setting users data:", {
          userCount: userData.length,
          totalPages: paginationData.totalPages || 1,
          usedFallback,
        });

        setUsers(userData);
        setTotalPages(paginationData.totalPages || 1);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      console.error("❌ Error in fetchUsers:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

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
      console.log("🏁 fetchUsers completed");
      setLoading(false);
    }
  }, [currentUser?.id, currentPage, searchTerm, roleFilter]); // Use only stable primitive values

  /**
   * Simple search handler - no complex state updates
   */
  const handleSearch = useCallback((searchValue) => {
    console.log("🔍 Search changed:", searchValue);
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page
  }, []);

  /**
   * Simple role filter handler
   */
  const handleRoleFilterChange = useCallback((role) => {
    console.log("🎭 Role filter changed:", role);
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page
  }, []);

  /**
   * Simple page change handler
   */
  const handlePageChange = useCallback((page) => {
    console.log("📄 Page changed:", page);
    setCurrentPage(page);
  }, []);

  /**
   * Simplified change user role
   */
  const changeUserRole = useCallback(
    async (userId, newRole) => {
      console.log("🔄 Changing user role:", { userId, newRole });

      // Basic validation
      if (userId === currentUser?.id) {
        return { success: false, error: "You cannot change your own role" };
      }

      try {
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
          // Update local state
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user.id === userId ? { ...user, role: newRole } : user
            )
          );
          return { success: true, message: `User role updated to ${newRole}` };
        } else {
          throw new Error(response.data?.message || "Failed to update role");
        }
      } catch (err) {
        console.error("❌ Role change error:", err.message);

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
      console.log("🗑️ Deleting user:", userId);

      if (userId === currentUser?.id) {
        return { success: false, error: "You cannot delete your own account" };
      }

      try {
        const token = localStorage.getItem("beekeeper_auth_token");
        const response = await axios.delete(
          `${API_URL}/admin/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (response.data?.success) {
          // Remove from local state
          setUsers(prevUsers =>
            prevUsers.filter(user => user.id !== userId)
          );
          return { success: true, message: "User deleted successfully" };
        } else {
          throw new Error(response.data?.message || "Failed to delete user");
        }
      } catch (err) {
        console.error("❌ Delete user error:", err.message);

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
    console.log("🔄 Resetting filters");
    setSearchTerm("");
    setRoleFilter("all");
    setCurrentPage(1);
  }, []);

  /**
   * Manual refetch
   */
  const refetch = useCallback(() => {
    console.log("🔄 Manual refetch triggered");
    fetchUsers();
  }, [fetchUsers]);

  // FIXED: Simplified useEffect with proper dependencies
  useEffect(() => {
    console.log("🔄 useEffect triggered - calling fetchUsers");
    fetchUsers();
  }, [fetchUsers]); // Only depend on fetchUsers which has all the necessary dependencies

  console.log("📊 useUserManagement returning:", {
    usersCount: users.length,
    loading,
    hasError: !!error,
    currentPage,
    totalPages,
  });

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
