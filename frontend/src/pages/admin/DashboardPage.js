// frontend/src/pages/admin/DashboardPage.js
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Alert, Spinner, Table } from "react-bootstrap";
import {
  BsFileEarmarkText,
  BsChatSquareText,
  BsPeople,
  BsTag,
  BsEye,
  BsArrowUp,
  BsArrowDown,
} from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";

/**
 * Admin Dashboard Page
 * 
 * Displays real-time statistics and recent activity for administrators.
 * Fetches actual data from the backend API.
 */
const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch dashboard statistics from the backend
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token
      const token = localStorage.getItem("beekeeper_auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch dashboard stats
      const statsResponse = await axios.get(`${API_URL}/admin/dashboard`, {
        headers,
      });

      // If the above fails, calculate stats from individual endpoints
      if (!statsResponse.data || !statsResponse.data.success) {
        // Fetch data from individual endpoints
        const [articlesRes, usersRes, tagsRes] = await Promise.all([
          axios.get(`${API_URL}/articles`, { headers }),
          axios.get(`${API_URL}/admin/users`, { headers }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/tags`, { headers }),
        ]);

        // Calculate stats from responses
        const articles = articlesRes.data.data || [];
        const users = usersRes.data.data || [];
        const tags = tagsRes.data.data || [];

        const calculatedStats = {
          articles: {
            total: articles.length,
            published: articles.filter(a => a.status === 'published' && !a.blocked).length,
            draft: articles.filter(a => a.status === 'draft').length,
            blocked: articles.filter(a => a.blocked).length,
          },
          comments: {
            total: articles.reduce((sum, a) => sum + (a.comment_count || 0), 0),
            approved: 0, // Would need separate endpoint
            pending: 0,
            rejected: 0,
          },
          users: {
            total: users.length,
            admin: users.filter(u => u.role === 'admin').length,
            author: users.filter(u => u.role === 'author').length,
            user: users.filter(u => u.role === 'user').length,
          },
          tags: {
            total: tags.length,
          },
          views: {
            total: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
            today: 0, // Would need time-based filtering
            thisWeek: 0,
            thisMonth: 0,
          },
        };

        setStats(calculatedStats);

        // Create recent activity from articles
        const recentArticles = articles
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
          .map(article => ({
            id: article.id,
            type: 'article',
            action: article.status === 'published' ? 'published' : 'created',
            title: article.title,
            user: article.author?.username || 'Unknown',
            timestamp: article.created_at,
          }));

        setRecentActivity(recentArticles);
      } else {
        setStats(statsResponse.data.data);
        
        // Fetch recent activity
        const activityRes = await axios.get(`${API_URL}/admin/activity`, {
          headers,
        }).catch(() => ({ data: { data: [] } }));
        
        setRecentActivity(activityRes.data.data || []);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Render activity type badge
   */
  const getActivityBadge = (type, action) => {
    const variants = {
      article: { published: 'success', created: 'primary', updated: 'info' },
      comment: { approved: 'success', pending: 'warning', rejected: 'danger' },
      user: { registered: 'primary', updated: 'info' },
    };

    return variants[type]?.[action] || 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <Row xs={1} md={2} lg={3} className="g-4 mb-4">
        {/* Articles Card */}
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Articles</h6>
                  <h3 className="mb-0">{stats?.articles?.total || 0}</h3>
                </div>
                <BsFileEarmarkText size={30} className="text-primary" />
              </div>
              <hr />
              <div className="d-flex justify-content-between small">
                <span>Published: {stats?.articles?.published || 0}</span>
                <span>Draft: {stats?.articles?.draft || 0}</span>
                {stats?.articles?.blocked > 0 && (
                  <span className="text-danger">Blocked: {stats?.articles?.blocked}</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Comments Card */}
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Comments</h6>
                  <h3 className="mb-0">{stats?.comments?.total || 0}</h3>
                </div>
                <BsChatSquareText size={30} className="text-warning" />
              </div>
              <hr />
              <div className="d-flex justify-content-between small">
                <span>Approved: {stats?.comments?.approved || 0}</span>
                <span>Pending: {stats?.comments?.pending || 0}</span>
                {stats?.comments?.rejected > 0 && (
                  <span className="text-danger">Rejected: {stats?.comments?.rejected}</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Users Card */}
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Users</h6>
                  <h3 className="mb-0">{stats?.users?.total || 0}</h3>
                </div>
                <BsPeople size={30} className="text-success" />
              </div>
              <hr />
              <div className="d-flex justify-content-between small">
                <span>Admin: {stats?.users?.admin || 0}</span>
                <span>Author: {stats?.users?.author || 0}</span>
                <span>User: {stats?.users?.user || 0}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Tags Card */}
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tags</h6>
                  <h3 className="mb-0">{stats?.tags?.total || 0}</h3>
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

        {/* Views Card */}
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Views</h6>
                  <h3 className="mb-0">{stats?.views?.total || 0}</h3>
                </div>
                <BsEye size={30} className="text-danger" />
              </div>
              <hr />
              <div className="d-flex justify-content-between small">
                <span>Today: {stats?.views?.today || 0}</span>
                <span>Week: {stats?.views?.thisWeek || 0}</span>
                <span>Month: {stats?.views?.thisMonth || 0}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Growth Card (if data available) */}
        {stats?.growth && (
          <Col>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Monthly Growth</h6>
                    <h3 className="mb-0 d-flex align-items-center">
                      {stats.growth.percentage > 0 ? (
                        <>
                          <BsArrowUp className="text-success me-1" />
                          <span className="text-success">{stats.growth.percentage}%</span>
                        </>
                      ) : (
                        <>
                          <BsArrowDown className="text-danger me-1" />
                          <span className="text-danger">{Math.abs(stats.growth.percentage)}%</span>
                        </>
                      )}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>  
          </Col>
        )}
      </Row>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Activity</h5>
        </Card.Header>
        <Card.Body>
          {recentActivity.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={`${activity.type}-${activity.id}`}>
                    <td>
                      <span className="badge bg-secondary">
                        {activity.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${getActivityBadge(activity.type, activity.action)}`}>
                        {activity.action}
                      </span>
                    </td>
                    <td>{activity.title || activity.details}</td>
                    <td>{activity.user}</td>
                    <td>{moment(activity.timestamp).fromNow()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center mb-0">
              No recent activity to display
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardPage;