// pages/admin/UsersPage.js (FINAL PRODUCTION VERSION)
/**
 * Complete production-ready admin users management page
 * Includes comprehensive error handling, loading states, and user feedback
 */
import React, { useState, useContext } from "react";
import { Button, Alert, Toast, ToastContainer } from "react-bootstrap";
import {
  BsPersonPlus,
  BsCheckCircle,
  BsExclamationTriangle,
} from "react-icons/bs";

// Custom hooks
import { useUserManagement } from "../../hooks/admin/useUserManagement";
import AuthContext from "../../contexts/AuthContext";

// Components
import UserFilters from "../../components/Admin/Users/UserFilters";
import UserTable from "../../components/Admin/Users/UserTable";
import RoleChangeModal from "../../components/Admin/Users/RoleChangeModal";
import DeleteUserModal from "../../components/Admin/Users/DeleteUserModal";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";

const UsersPage = () => {
  const { user: currentUser } = useContext(AuthContext);

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

  // Modal state
  const [roleModal, setRoleModal] = useState({
    show: false,
    user: null,
    loading: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    user: null,
    loading: false,
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  /**
   * Add toast notification
   */
  const addToast = (message, variant = "success") => {
    const id = Date.now();
    const toast = { id, message, variant };
    setToasts((prev) => [...prev, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  /**
   * Remove toast notification
   */
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Handle role change confirmation
   */
  const handleRoleChangeConfirm = async (newRole) => {
    setRoleModal((prev) => ({ ...prev, loading: true }));

    const result = await changeUserRole(roleModal.user.id, newRole);

    if (result.success) {
      addToast(result.message, "success");
      setRoleModal({ show: false, user: null, loading: false });
    } else {
      addToast(result.error, "danger");
    }

    setRoleModal((prev) => ({ ...prev, loading: false }));
  };

  /**
   * Handle user deletion confirmation
   */
  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }));

    const result = await deleteUser(deleteModal.user.id);

    if (result.success) {
      addToast(result.message, "success");
      setDeleteModal({ show: false, user: null, loading: false });
    } else {
      addToast(result.error, "danger");
    }

    setDeleteModal((prev) => ({ ...prev, loading: false }));
  };

  // Loading state
  if (loading && users.length === 0) {
    return <LoadingIndicator message="Loading users..." />;
  }

  // Error state (only if no users loaded)
  if (error && users.length === 0) {
    return (
      <div className="admin-users-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Manage Users</h1>
        </div>
        <ErrorAlert error={error} onRetry={refetch} />
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="admin-users-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Manage Users</h1>
          <Button variant="primary" disabled>
            <BsPersonPlus className="me-2" />
            Add User
          </Button>
        </div>

        <EmptyState
          icon={BsPersonPlus}
          title="No users found"
          message="There are no users in the system or your search didn't match any users."
          action={
            <Button variant="primary" onClick={resetFilters}>
              Clear Filters
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Manage Users</h1>
          <p className="text-muted mb-0">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button variant="primary" disabled>
          <BsPersonPlus className="me-2" />
          Add User
        </Button>
      </div>

      {/* Error Alert (for errors during operations) */}
      {error && users.length > 0 && (
        <Alert variant="warning" dismissible className="mb-4">
          <BsExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <UserFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        onSearch={handleSearch}
        onRoleFilterChange={handleRoleFilterChange}
        onReset={resetFilters}
        loading={loading}
        resultCount={users.length}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        currentPage={currentPage}
        totalPages={totalPages}
        currentUserId={currentUser?.id}
        onPageChange={handlePageChange}
        onRoleChange={(user) =>
          setRoleModal({ show: true, user, loading: false })
        }
        onDelete={(user) =>
          setDeleteModal({ show: true, user, loading: false })
        }
      />

      {/* Loading overlay for table operations */}
      {loading && users.length > 0 && (
        <div className="text-center mt-3">
          <small className="text-muted">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Updating...
          </small>
        </div>
      )}

      {/* Modals */}
      <RoleChangeModal
        show={roleModal.show}
        user={roleModal.user}
        loading={roleModal.loading}
        onHide={() => setRoleModal({ show: false, user: null, loading: false })}
        onConfirm={handleRoleChangeConfirm}
      />

      <DeleteUserModal
        show={deleteModal.show}
        user={deleteModal.user}
        loading={deleteModal.loading}
        onHide={() =>
          setDeleteModal({ show: false, user: null, loading: false })
        }
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast Notifications */}
      <ToastContainer position="bottom-end" className="p-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={5000}
            autohide
            bg={toast.variant}
          >
            <Toast.Header>
              <BsCheckCircle className="me-2" />
              <strong className="me-auto">
                {toast.variant === "success" ? "Success" : "Error"}
              </strong>
            </Toast.Header>
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  );
};

export default UsersPage;
