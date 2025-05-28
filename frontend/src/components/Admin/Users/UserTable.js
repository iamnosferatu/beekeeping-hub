// components/Admin/Users/UserTable.js
/**
 * Table component for displaying users with actions
 * Handles complex table rendering and user interactions
 */
import React from "react";
import { Link } from "react-router-dom";
import { Card, Table, Button, Badge, Pagination } from "react-bootstrap";
import {
  BsPencilSquare,
  BsTrash,
  BsEnvelope,
  BsShieldFill,
} from "react-icons/bs";
import moment from "moment";

const UserTable = ({
  users,
  currentPage,
  totalPages,
  currentUserId,
  onPageChange,
  onRoleChange,
  onDelete,
}) => {
  /**
   * Get role badge configuration
   */
  const getRoleBadge = (role) => {
    const badgeConfig = {
      admin: { variant: "danger", icon: <BsShieldFill className="me-1" /> },
      author: { variant: "warning", icon: null },
      user: { variant: "info", icon: null },
    };

    return badgeConfig[role] || { variant: "secondary", icon: null };
  };

  /**
   * Format user display name
   */
  const getUserDisplayName = (user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return fullName || user.username || "Unknown User";
  };

  /**
   * Check if user actions should be disabled
   */
  const isCurrentUser = (userId) => userId === currentUserId;

  return (
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
                users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const isCurrentUserRow = isCurrentUser(user.id);

                  return (
                    <tr key={user.id}>
                      {/* ID */}
                      <td>{user.id}</td>

                      {/* User Info */}
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
                            {isCurrentUserRow && (
                              <Badge bg="primary" className="ms-2 small">
                                You
                              </Badge>
                            )}
                            <div className="small text-muted">
                              {getUserDisplayName(user)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <a
                          href={`mailto:${user.email}`}
                          className="text-decoration-none"
                        >
                          <BsEnvelope className="me-1" />
                          {user.email}
                        </a>
                      </td>

                      {/* Role */}
                      <td>
                        <Badge bg={roleBadge.variant}>
                          {roleBadge.icon}
                          {user.role}
                        </Badge>
                      </td>

                      {/* Article Count */}
                      <td>{user.article_count || 0}</td>

                      {/* Join Date */}
                      <td>
                        {user.created_at
                          ? moment(user.created_at).format("MMM D, YYYY")
                          : "-"}
                      </td>

                      {/* Last Active */}
                      <td>
                        {user.last_login
                          ? moment(user.last_login).fromNow()
                          : "Never"}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            title="Change Role"
                            onClick={() => onRoleChange(user)}
                            disabled={isCurrentUserRow}
                          >
                            <BsPencilSquare />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete User"
                            onClick={() => onDelete(user)}
                            disabled={isCurrentUserRow}
                          >
                            <BsTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={currentPage === index + 1}
                onClick={() => onPageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </Card.Footer>
      )}
    </Card>
  );
};

export default UserTable;
