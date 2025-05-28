// components/Admin/Users/UserFilters.js (ENHANCED with better UX)
/**
 * Enhanced search and filter controls with better UX
 * Includes loading states and clear visual feedback
 */
import React, { useState, useEffect } from "react";
import { Card, Form, Button, InputGroup, Badge } from "react-bootstrap";
import { BsSearch, BsFilter, BsX } from "react-icons/bs";

const UserFilters = ({
  searchTerm,
  roleFilter,
  onSearch,
  onRoleFilterChange,
  onReset,
  loading = false,
  resultCount = 0,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        setIsSearching(true);
        onSearch(localSearchTerm);
        setTimeout(() => setIsSearching(false), 500);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, searchTerm, onSearch]);

  /**
   * Handle search form submission
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  /**
   * Clear search input
   */
  const clearSearch = () => {
    setLocalSearchTerm("");
    onSearch("");
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = searchTerm || roleFilter !== "all";

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Form onSubmit={handleSearchSubmit}>
          <div className="row g-3 align-items-end">
            {/* Search Input */}
            <div className="col-md-6">
              <Form.Label className="small text-muted">Search Users</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <BsSearch className={isSearching ? "text-primary" : ""} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  disabled={loading}
                />
                {localSearchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={clearSearch}
                    disabled={loading}
                  >
                    <BsX />
                  </Button>
                )}
                <Button type="submit" variant="primary" disabled={loading}>
                  Search
                </Button>
              </InputGroup>
            </div>

            {/* Role Filter */}
            <div className="col-md-4">
              <Form.Label className="small text-muted">
                Filter by Role
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <BsFilter />
                </InputGroup.Text>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => onRoleFilterChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="author">Authors</option>
                  <option value="user">Regular Users</option>
                </Form.Select>
              </InputGroup>
            </div>

            {/* Reset Button */}
            <div className="col-md-2">
              <Button
                variant="outline-secondary"
                onClick={onReset}
                disabled={loading || !hasActiveFilters}
                className="w-100"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <small className="text-muted me-2">Active filters:</small>

                {searchTerm && (
                  <Badge bg="primary" className="d-flex align-items-center">
                    Search: "{searchTerm}"
                    <BsX
                      className="ms-1"
                      style={{ cursor: "pointer" }}
                      onClick={clearSearch}
                    />
                  </Badge>
                )}

                {roleFilter !== "all" && (
                  <Badge bg="secondary" className="d-flex align-items-center">
                    Role: {roleFilter}
                    <BsX
                      className="ms-1"
                      style={{ cursor: "pointer" }}
                      onClick={() => onRoleFilterChange("all")}
                    />
                  </Badge>
                )}

                <small className="text-muted ms-auto">
                  {resultCount} user{resultCount !== 1 ? "s" : ""} found
                </small>
              </div>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UserFilters;
