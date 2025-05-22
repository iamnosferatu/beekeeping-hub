// frontend/src/pages/admin/DashboardPage.js - WITH CUSTOM HOOK
import React from "react";
import { Card, Row, Col, Alert, Spinner, Button } from "react-bootstrap";
import {
  BsFileEarmarkText,
  BsChatSquareText,
  BsPeople,
  BsTag,
  BsEye,
  BsExclamationTriangle,
  BsArrowRepeat,
} from "react-icons/bs";
import useAdminDashboard from "../../hooks/useAdminDashboard";

const DashboardPage = () => {
  const { stats, recentActivity, loading, error, refetch } =
    useAdminDashboard();

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard statistics...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>
          <BsExclamationTriangle className="me-2" />
          Error Loading Dashboard
        </Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={refetch}>
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  // Show empty state if no stats
  if (!stats) {
    return (
      <Alert variant="warning">
        <Alert.Heading>No Data Available</Alert.Heading>
        <p>Dashboard statistics are not available at the moment.</p>
        <div className="d-flex justify-content-end">
          <Button variant="outline-warning" onClick={refetch}>
            <BsArrowRepeat className="me-1" />
            Refresh
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">My Admin Dashboard</h1>
        <Button variant="outline-primary" onClick={refetch} size="sm">
          <BsArrowRepeat className="me-1" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <Row xs={1} md={2} lg={3} className="g-4 mb-4">
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Articles</h6>
                  <h3 className="mb-0">{stats.articles?.total || 0}</h3>
                </div>
                <BsFileEarmarkText size={30} className="text-primary" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Published: {stats.articles?.published || 0}</small>
                <small>Draft: {stats.articles?.draft || 0}</small>
                <small>Archived: {stats.articles?.archived || 0}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Comments</h6>
                  <h3 className="mb-0">{stats.comments?.total || 0}</h3>
                </div>
                <BsChatSquareText size={30} className="text-warning" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Approved: {stats.comments?.approved || 0}</small>
                <small>Pending: {stats.comments?.pending || 0}</small>
                <small>Rejected: {stats.comments?.rejected || 0}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Users</h6>
                  <h3 className="mb-0">{stats.users?.total || 0}</h3>
                </div>
                <BsPeople size={30} className="text-success" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Admin: {stats.users?.admin || 0}</small>
                <small>Author: {stats.users?.author || 0}</small>
                <small>User: {stats.users?.user || 0}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tags</h6>
                  <h3 className="mb-0">{stats.tags?.total || 0}</h3>
                </div>
                <BsTag size={30} className="text-info" />
              </div>
              <hr />
              <div>
                <small>Used to categorize and organize articles</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Views</h6>
                  <h3 className="mb-0">{stats.views?.total || 0}</h3>
                </div>
                <BsEye size={30} className="text-danger" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Today: {stats.views?.today || 0}</small>
                <small>Week: {stats.views?.thisWeek || 0}</small>
                <small>Month: {stats.views?.thisMonth || 0}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Activity</h5>
          <Button variant="outline-primary" size="sm" onClick={refetch}>
            <BsArrowRepeat className="me-1" />
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="list-group list-group-flush">
              {recentActivity.map((activity, index) => (
                <div key={index} className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{activity.type}</strong>
                      <p className="mb-1">{activity.description}</p>
                      <small className="text-muted">{activity.user}</small>
                    </div>
                    <small className="text-muted">{activity.timestamp}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="mb-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0">
                    <strong>Recent Activity Tracking</strong>
                  </p>
                  <p className="mb-0">
                    Activity tracking will show recent actions like new user
                    registrations, article submissions, comments, and
                    administrative actions.
                  </p>
                </div>
                <Button variant="outline-info" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardPage;
