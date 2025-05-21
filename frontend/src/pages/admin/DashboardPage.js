// frontend/src/pages/admin/DashboardPage.js
import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import {
  BsFileEarmarkText,
  BsChatSquareText,
  BsPeople,
  BsTag,
  BsEye,
} from "react-icons/bs";

const DashboardPage = () => {
  // Mock data for dashboard
  const stats = {
    articles: {
      total: 15,
      published: 10,
      draft: 3,
      archived: 2,
    },
    comments: {
      total: 25,
      approved: 18,
      pending: 5,
      rejected: 2,
    },
    users: {
      total: 45,
      admin: 1,
      author: 3,
      user: 41,
    },
    tags: {
      total: 8,
    },
    views: {
      total: 1250,
      today: 135,
      thisWeek: 650,
      thisMonth: 1250,
    },
  };

  return (
    <div className="dashboard-page">
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Stats Cards */}
      <Row xs={1} md={2} lg={3} className="g-4 mb-4">
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Articles</h6>
                  <h3 className="mb-0">{stats.articles.total}</h3>
                </div>
                <BsFileEarmarkText size={30} className="text-primary" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Published: {stats.articles.published}</small>
                <small>Draft: {stats.articles.draft}</small>
                <small>Archived: {stats.articles.archived}</small>
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
                  <h3 className="mb-0">{stats.comments.total}</h3>
                </div>
                <BsChatSquareText size={30} className="text-warning" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Approved: {stats.comments.approved}</small>
                <small>Pending: {stats.comments.pending}</small>
                <small>Rejected: {stats.comments.rejected}</small>
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
                  <h3 className="mb-0">{stats.users.total}</h3>
                </div>
                <BsPeople size={30} className="text-success" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Admin: {stats.users.admin}</small>
                <small>Author: {stats.users.author}</small>
                <small>User: {stats.users.user}</small>
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
                  <h3 className="mb-0">{stats.tags.total}</h3>
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
                  <h3 className="mb-0">{stats.views.total}</h3>
                </div>
                <BsEye size={30} className="text-danger" />
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <small>Today: {stats.views.today}</small>
                <small>Week: {stats.views.thisWeek}</small>
                <small>Month: {stats.views.thisMonth}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity (placeholder) */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Activity</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-0">
            This is a placeholder for the recent activity section. The actual
            implementation will show recent comments, article submissions, etc.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardPage;
