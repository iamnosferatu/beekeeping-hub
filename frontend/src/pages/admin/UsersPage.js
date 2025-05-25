// frontend/src/pages/admin/UsersPage.js
import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Form,
  Modal,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import {
  BsSearch,
  BsPersonPlus,
  BsPencilSquare,
  BsTrash,
  BsShieldFill,
  BsExclamationTriangle,
  BsEnvelope,
  BsCalendar,
} from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../../config";
import AuthContext from "../../contexts/AuthContext";
import moment from "moment";

/**
 * Admin Users Management Page
 *
 * Allows administrators to view and manage all users in the system.
 * Includes role management, search, and user details viewing.
 */
const UsersPage = () => {
  const { user: currentUser } = useContext(AuthContext);

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Fetch users from the backend
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("beekeeper_auth_token");
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      };

      // Try admin endpoint first
      let response;
      try {
        response = await axios.get(`${API_URL}/admin/users`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (adminError) {
        // Fallback to getting users from articles authors if admin endpoint fails
        console.log("Admin users endpoint failed, trying alternative approach");

        const articlesResponse = await axios.get(`${API_URL}/articles`, {
          params: { limit: 100 },
          headers: { Authorization: `Bearer ${token}` },
        });

        // Extract unique authors
        const authorsMap = new Map();
        (articlesResponse.data.data || []).forEach((article) => {
          if (article.author && article.author.id) {
            authorsMap.set(article.author.id, article.author);
          }
        });

        // Add current user if not in the list
        if (currentUser && !authorsMap.has(currentUser.id)) {
          authorsMap.set(currentUser.id, currentUser);
        }

        const uniqueUsers = Array.from(authorsMap.values());

        // Apply filters
        let filteredUsers = uniqueUsers;
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              `${user.first_name} ${user.last_name}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
        }
        if (roleFilter !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.role === roleFilter
          );
        }

        response = {
          data: {
            success: true,
            data: filteredUsers,
            pagination: {
              totalPages: 1,
              page: 1,
            },
          },
        };
      }

      if (response.data.success || response.data.data) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  /**
   * Handle search submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  /**
   * Handle role change
   */
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.put(
        `${API_URL}/admin/users/${selectedUser.id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, role: newRole } : user
          )
        );

        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole("");
      }
    } catch (error) {
      console.error("Error changing user role:", error);

      // If the endpoint doesn't exist, show a message
      if (error.response?.status === 404) {
        alert(
          "Role management endpoint not implemented. This would update the user's role in a production system."
        );
      } else {
        alert("Failed to update user role. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle user deletion
   */
  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.delete(
        `${API_URL}/admin/users/${selectedUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove from local state
        setUsers(users.filter((user) => user.id !== selectedUser.id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      if (error.response?.status === 404) {
        alert(
          "User deletion endpoint not implemented. This would delete the user in a production system."
        );
      } else {
        alert("Failed to delete user. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Get role badge variant
   */
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return { variant: "danger", icon: <BsShieldFill className="me-1" /> };
      case "author":
        return { variant: "warning", icon: null };
      case "user":
        return { variant: "info", icon: null };
      default:
        return { variant: "secondary", icon: null };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Manage Users</h1>
        <Button variant="primary" disabled>
          <BsPersonPlus className="me-2" />
          Add User
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-6">
                <InputGroup>
                  <InputGroup.Text>
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, username, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                </InputGroup>
              </div>
              <div className="col-md-4">
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="author">Authors</option>
                  <option value="user">Regular Users</option>
                </Form.Select>
              </div>
              <div className="col-md-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setCurrentPage(1);
                  }}
                  className="w-100"
                >
                  Reset
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Articles</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              user.avatar ||
                              "https://via.placeholder.com/40x40?text=👤"
                            }
                            alt={user.username}
                            className="rounded-circle me-2"
                            width="40"
                            height="40"
                            style={{ objectFit: "cover" }}
                          />
                          <div>
                            <strong>{user.username}</strong>
                            <div className="small text-muted">
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <a href={`mailto:${user.email}`}>
                          <BsEnvelope className="me-1" />
                          {user.email}
                        </a>
                      </td>
                      <td>
                        <Badge bg={getRoleBadge(user.role).variant}>
                          {getRoleBadge(user.role).icon}
                          {user.role}
                        </Badge>
                      </td>
                      <td>{user.article_count || 0}</td>
                      <td>
                        {user.created_at
                          ? moment(user.created_at).format("MMM D, YYYY")
                          : "-"}
                      </td>
                      <td>
                        {user.last_login
                          ? moment(user.last_login).fromNow()
                          : "Never"}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            title="Change Role"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleModal(true);
                            }}
                            disabled={user.id === currentUser?.id}
                          >
                            <BsPencilSquare />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete User"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            disabled={user.id === currentUser?.id}
                          >
                            <BsTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer>
            <Pagination className="mb-0 justify-content-center">
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}

              <Pagination.Next
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Update role for user: <strong>{selectedUser?.username}</strong>
          </p>
          <Form.Group>
            <Form.Label>Select New Role</Form.Label>
            <Form.Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="user">Regular User</option>
              <option value="author">Author</option>
              <option value="admin">Administrator</option>
            </Form.Select>
          </Form.Group>
          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> Changing user roles affects their
            permissions across the entire system.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRoleChange}
            disabled={actionLoading || newRole === selectedUser?.role}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Update Role"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <BsExclamationTriangle size={50} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this user?</h5>
            <p className="text-muted">
              {selectedUser?.username} ({selectedUser?.email})
            </p>
            <Alert variant="danger">
              This will also delete all articles and comments by this user!
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Delete User"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersPage;
