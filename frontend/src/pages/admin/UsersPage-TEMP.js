// pages/admin/UsersPage.js (DEBUG VERSION - Minimal and Working)
/**
 * Simplified debug version of UsersPage to identify the hanging issue
 * This strips away complexity to get basic functionality working first
 */
import React, { useState, useContext } from "react";
import { Button, Alert, Spinner, Card, Table } from "react-bootstrap";
import { BsPersonPlus } from "react-icons/bs";

// Custom hooks
import { useUserManagement } from "../../hooks/admin/useUserManagement";
import AuthContext from "../../contexts/AuthContext";

const UsersPage = () => {
  const { user: currentUser } = useContext(AuthContext);

  console.log("🎯 UsersPage render", { currentUser: currentUser?.username });

  // Custom hook handles all business logic
  const {
    users,
    loading,
    error,
    searchTerm,
    roleFilter,
    currentPage,
    totalPages,
    handleSearch,
    handleRoleFilterChange,
    handlePageChange,
    changeUserRole,
    deleteUser,
    resetFilters,
    refetch,
    isEmpty,
  } = useUserManagement();

  console.log("🎯 UsersPage hook data:", {
    usersCount: users?.length || 0,
    loading,
    hasError: !!error,
    isEmpty,
  });

  // Very simple state for debugging
  const [localSearch, setLocalSearch] = useState("");

  /**
   * Debug: Simple search handler
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("🔍 Search submitted:", localSearch);
    handleSearch(localSearch);
  };

  // Debug: Show what we're getting
  console.log("🎯 Rendering UsersPage with state:", {
    loading,
    error: error?.slice(0, 100),
    usersCount: users?.length,
    isEmpty,
  });

  // Loading state - show debug info
  if (loading) {
    return (
      <div className="admin-users-page">
        <h1>Manage Users (DEBUG MODE)</h1>

        <Card className="mb-4">
          <Card.Body>
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading users...</p>
              <div className="text-muted small">
                <div>Current User: {currentUser?.username || "None"}</div>
                <div>Current User ID: {currentUser?.id || "None"}</div>
                <div>Search Term: "{searchTerm}"</div>
                <div>Role Filter: {roleFilter}</div>
                <div>Page: {currentPage}</div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Debug: Force retry button */}
        <div className="text-center">
          <Button variant="warning" onClick={refetch}>
            Force Retry (Debug)
          </Button>
        </div>
      </div>
    );
  }

  // Error state - show debug info
  if (error) {
    return (
      <div className="admin-users-page">
        <h1>Manage Users (DEBUG MODE)</h1>

        <Alert variant="danger">
          <Alert.Heading>Error Loading Users</Alert.Heading>
          <p>
            <strong>Error:</strong> {error}
          </p>
          <hr />
          <div className="text-muted small">
            <div>
              <strong>Current User:</strong> {currentUser?.username || "None"}
            </div>
            <div>
              <strong>Current User Role:</strong> {currentUser?.role || "None"}
            </div>
            <div>
              <strong>Token exists:</strong>{" "}
              {localStorage.getItem("beekeeper_auth_token") ? "Yes" : "No"}
            </div>
            <div>
              <strong>API URL:</strong>{" "}
              {process.env.REACT_APP_API_URL || "http://localhost:8080/api"}
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button variant="outline-danger" onClick={refetch}>
              Try Again
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="admin-users-page">
        <h1>Manage Users (DEBUG MODE)</h1>

        <Alert variant="info">
          <Alert.Heading>No Users Found</Alert.Heading>
          <p>No users are available or your search didn't match any users.</p>
          <div className="text-muted small mb-3">
            <div>Search: "{searchTerm}"</div>
            <div>Role Filter: {roleFilter}</div>
          </div>
          <Button variant="primary" onClick={resetFilters}>
            Clear Filters
          </Button>
        </Alert>
      </div>
    );
  }

  // Success state - show users
  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Manage Users (DEBUG MODE)</h1>
          <p className="text-muted mb-0">
            Found {users.length} users (Page {currentPage} of {totalPages})
          </p>
        </div>
        <Button variant="primary" disabled>
          <BsPersonPlus className="me-2" />
          Add User
        </Button>
      </div>

      {/* Simple Search Form */}
      <Card className="mb-4">
        <Card.Body>
          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="author">Author</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="col-md-3">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Card.Body>
      </Card>

      {/* Simple Users Table */}
      <Card>
        <Card.Body className="p-0">
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Articles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          user.avatar ||
                          "https://via.placeholder.com/32x32?text=👤"
                        }
                        alt={user.username}
                        className="rounded-circle me-2"
                        width="32"
                        height="32"
                      />
                      <div>
                        <strong>{user.username}</strong>
                        {user.id === currentUser?.id && (
                          <span className="badge bg-primary ms-2 small">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        user.role === "admin"
                          ? "danger"
                          : user.role === "author"
                          ? "warning"
                          : "info"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.article_count || 0}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const newRole = prompt(
                            `Change ${user.username}'s role to:`,
                            user.role
                          );
                          if (newRole && newRole !== user.role) {
                            changeUserRole(user.id, newRole).then((result) => {
                              alert(
                                result.success ? result.message : result.error
                              );
                            });
                          }
                        }}
                        disabled={user.id === currentUser?.id}
                      >
                        Edit Role
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (window.confirm(`Delete user ${user.username}?`)) {
                            deleteUser(user.id).then((result) => {
                              alert(
                                result.success ? result.message : result.error
                              );
                            });
                          }
                        }}
                        disabled={user.id === currentUser?.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>

        {/* Simple Pagination */}
        {totalPages > 1 && (
          <Card.Footer>
            <div className="d-flex justify-content-center">
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="btn btn-primary disabled">
                  {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Debug Info */}
      <Card className="mt-4">
        <Card.Header>Debug Information</Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <h6>Hook State:</h6>
              <ul className="list-unstyled small">
                <li>Users: {users.length}</li>
                <li>Loading: {loading ? "Yes" : "No"}</li>
                <li>Error: {error ? "Yes" : "No"}</li>
                <li>Empty: {isEmpty ? "Yes" : "No"}</li>
                <li>Current Page: {currentPage}</li>
                <li>Total Pages: {totalPages}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Auth State:</h6>
              <ul className="list-unstyled small">
                <li>Current User: {currentUser?.username || "None"}</li>
                <li>User Role: {currentUser?.role || "None"}</li>
                <li>User ID: {currentUser?.id || "None"}</li>
                <li>
                  Token:{" "}
                  {localStorage.getItem("beekeeper_auth_token")
                    ? "Present"
                    : "Missing"}
                </li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UsersPage;
