// frontend/src/pages/admin/DashboardPage.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Row, Col, Alert, Spinner, Table, Button } from "react-bootstrap";
import {
  BsFileEarmarkText,
  BsChatSquareText,
  BsPeople,
  BsTag,
  BsEye,
  BsArrowUp,
  BsArrowRepeat,
  BsExclamationTriangle,
} from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";
import BaseCard from "../../components/common/BaseCard";

/**
 * Admin Dashboard Page - Fixed Version
 *
 * Properly handles data fetching and displays real statistics
 * with error handling and loading states.
 */
const DashboardPage = () => {
  // State management with proper initial values
  const [stats, setStats] = useState({
    articles: { total: 0, published: 0, draft: 0, blocked: 0 },
    comments: { total: 0, approved: 0, pending: 0, rejected: 0 },
    users: { total: 0, admin: 0, author: 0, user: 0 },
    tags: { total: 0 },
    views: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Memoized calculations for stats display to prevent unnecessary re-renders
  const displayStats = useMemo(() => {
    // Return the stats as-is since they're already calculated in state
    return stats;
  }, [stats]);

  const displayActivity = useMemo(() => {
    // Return the activity as-is since it's already calculated in state
    return recentActivity;
  }, [recentActivity]);

  /**
   * Fetch dashboard statistics from the backend (memoized)
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token
      const token = localStorage.getItem("beekeeper_auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetching dashboard data

      // Try to fetch from admin dashboard endpoint first
      try {
        const dashboardResponse = await axios.get(
          `${API_URL}/admin/dashboard`,
          {
            headers,
            timeout: 10000,
          }
        );

        if (dashboardResponse.data?.success && dashboardResponse.data?.data) {
          // Dashboard data from admin endpoint received
          setStats(dashboardResponse.data.data);

          // Also try to get recent activity
          try {
            const activityResponse = await axios.get(
              `${API_URL}/admin/activity`,
              {
                headers,
                timeout: 5000,
              }
            );
            if (activityResponse.data?.data) {
              setRecentActivity(activityResponse.data.data);
            }
          } catch (activityError) {
            console.log("Could not fetch activity, using empty array");
            setRecentActivity([]);
          }

          return; // Exit if successful
        }
      } catch (dashboardError) {
        console.log(
          "Admin dashboard endpoint not available, calculating stats manually"
        );
      }

      // If admin endpoint fails, calculate stats from individual endpoints
      const requests = [];

      // Fetch articles
      requests.push(
        axios
          .get(`${API_URL}/articles`, {
            headers,
            params: { limit: 100 },
            timeout: 10000,
          })
          .catch((err) => {
            console.error("Error fetching articles:", err);
            return { data: { data: [] } };
          })
      );

      // Try to fetch users (may fail if endpoint doesn't exist)
      requests.push(
        axios
          .get(`${API_URL}/admin/users`, {
            headers,
            timeout: 10000,
          })
          .catch(() => {
            console.log("Admin users endpoint not available");
            return { data: { data: [] } };
          })
      );

      // Fetch tags
      requests.push(
        axios
          .get(`${API_URL}/tags`, {
            headers,
            timeout: 10000,
          })
          .catch((err) => {
            console.error("Error fetching tags:", err);
            return { data: { data: [] } };
          })
      );

      // Fetch comments (may need adjustment based on your API)
      requests.push(
        axios
          .get(`${API_URL}/comments`, {
            headers,
            params: { limit: 100 },
            timeout: 10000,
          })
          .catch(() => {
            console.log("Comments endpoint not available");
            return { data: { data: [] } };
          })
      );

      // Execute all requests in parallel
      const [articlesRes, usersRes, tagsRes, commentsRes] = await Promise.all(
        requests
      );

      // Extract data safely with proper array checks
      const articles = Array.isArray(articlesRes.data?.data)
        ? articlesRes.data.data
        : Array.isArray(articlesRes.data)
        ? articlesRes.data
        : [];

      const users = Array.isArray(usersRes.data?.data)
        ? usersRes.data.data
        : Array.isArray(usersRes.data)
        ? usersRes.data
        : [];

      const tags = Array.isArray(tagsRes.data?.data)
        ? tagsRes.data.data
        : Array.isArray(tagsRes.data)
        ? tagsRes.data
        : [];

      const comments = Array.isArray(commentsRes.data?.data)
        ? commentsRes.data.data
        : Array.isArray(commentsRes.data)
        ? commentsRes.data
        : [];

      console.log("Fetched data:", {
        articles: articles.length,
        users: users.length,
        tags: tags.length,
        comments: comments.length,
      });

      // Calculate statistics with null safety
      const calculatedStats = {
        articles: {
          total: articles.length,
          published: articles.filter(
            (a) => a && a.status === "published" && !a.blocked
          ).length,
          draft: articles.filter((a) => a && a.status === "draft").length,
          blocked: articles.filter((a) => a && a.blocked === true).length,
        },
        comments: {
          total: comments.length,
          approved: comments.filter((c) => c && c.status === "approved").length,
          pending: comments.filter(
            (c) => c && (!c.status || c.status === "pending")
          ).length,
          rejected: comments.filter((c) => c && c.status === "rejected").length,
        },
        users: {
          total: users.length || 0,
          admin: users.filter((u) => u && u.role === "admin").length || 0,
          author: users.filter((u) => u && u.role === "author").length || 0,
          user: users.filter((u) => u && u.role === "user").length || 0,
        },
        tags: {
          total: tags.length,
        },
        views: {
          total: articles.reduce((sum, a) => sum + (a?.view_count || 0), 0),
          today: 0, // Would need time-based filtering
          thisWeek: 0, // Would need time-based filtering
          thisMonth: 0, // Would need time-based filtering
        },
      };

      setStats(calculatedStats);

      // If no users found from API, try to extract from articles
      if (calculatedStats.users.total === 0 && articles.length > 0) {
        const uniqueAuthors = new Map();
        articles.forEach((article) => {
          if (article.author && article.author.id) {
            uniqueAuthors.set(article.author.id, article.author);
          }
        });

        const authorsArray = Array.from(uniqueAuthors.values());
        calculatedStats.users = {
          total: authorsArray.length,
          admin: authorsArray.filter((u) => u.role === "admin").length,
          author: authorsArray.filter((u) => u.role === "author").length,
          user: authorsArray.filter((u) => u.role === "user").length,
        };
      }

      setStats(calculatedStats);

      // Create recent activity from available data
      const recentArticles = articles
        .filter((a) => a && a.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map((article) => ({
          id: article.id,
          type: "article",
          action: article.status === "published" ? "published" : "created",
          title: article.title || "Untitled",
          user: article.author?.username || "Unknown",
          timestamp: article.created_at,
        }));

      const recentComments = comments
        .filter((c) => c && c.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map((comment) => ({
          id: comment.id,
          type: "comment",
          action: comment.status || "pending",
          title: comment.content
            ? comment.content.substring(0, 50) + "..."
            : "No content",
          user: comment.author?.username || "Anonymous",
          timestamp: comment.created_at,
        }));

      // Combine and sort activities
      const combinedActivity = [...recentArticles, ...recentComments]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setRecentActivity(combinedActivity);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        "Failed to load dashboard data. Please check your connection and try again."
      );

      // Set default empty values on error
      setStats({
        articles: { total: 0, published: 0, draft: 0, blocked: 0 },
        comments: { total: 0, approved: 0, pending: 0, rejected: 0 },
        users: { total: 0, admin: 0, author: 0, user: 0 },
        tags: { total: 0 },
        views: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Manual refresh handler (memoized)
   */
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Get activity badge variant based on type and action (memoized)
   */
  const getActivityBadge = useCallback((type, action) => {
    const variants = {
      article: {
        published: "success",
        created: "primary",
        updated: "info",
        draft: "secondary",
      },
      comment: {
        approved: "success",
        pending: "warning",
        rejected: "danger",
        created: "primary",
      },
      user: {
        registered: "primary",
        updated: "info",
      },
    };

    return variants[type]?.[action] || "secondary";
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  // Error state
  if (error && stats.articles.total === 0) {
    return (
      <Alert variant="danger">
        <Alert.Heading>
          <BsExclamationTriangle className="me-2" />
          Error Loading Dashboard
        </Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={handleRefresh}>
          <BsArrowRepeat className="me-2" />
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Admin Dashboard</h1>
        <div>
          <small className="text-muted me-3">
            Last updated: {moment(lastRefresh).format("h:mm:ss A")}
          </small>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <BsArrowRepeat className={loading ? "spin" : ""} />
            {loading ? " Refreshing..." : " Refresh"}
          </Button>
        </div>
      </div>

      {/* Error Alert if there's an error but we have some data */}
      {error && stats.articles.total > 0 && (
        <Alert variant="warning" dismissible>
          <BsExclamationTriangle className="me-2" />
          Some data may be outdated. {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row xs={1} md={2} xl={3} className="g-4 mb-4">
        {/* Articles Card */}
        <Col>
          <BaseCard.Stats
            title="Articles"
            value={displayStats.articles.total}
            icon={BsFileEarmarkText}
            footer={
              <div className="d-flex justify-content-between small">
                <span className="text-success">
                  Published: <strong>{displayStats.articles.published}</strong>
                </span>
                <span className="text-secondary">
                  Draft: <strong>{displayStats.articles.draft}</strong>
                </span>
                {displayStats.articles.blocked > 0 && (
                  <span className="text-danger">
                    Blocked: <strong>{displayStats.articles.blocked}</strong>
                  </span>
                )}
              </div>
            }
          />
        </Col>

        {/* Comments Card */}
        <Col>
          <BaseCard.Stats
            title="Comments"
            value={displayStats.comments.total}
            icon={BsChatSquareText}
            footer={
              <div className="d-flex justify-content-between small">
                <span className="text-success">
                  Approved: <strong>{displayStats.comments.approved}</strong>
                </span>
                <span className="text-warning">
                  Pending: <strong>{displayStats.comments.pending}</strong>
                </span>
                {displayStats.comments.rejected > 0 && (
                  <span className="text-danger">
                    Rejected: <strong>{displayStats.comments.rejected}</strong>
                  </span>
                )}
              </div>
            }
          />
        </Col>

        {/* Users Card */}
        <Col>
          <BaseCard.Stats
            title="Users"
            value={displayStats.users.total}
            icon={BsPeople}
            footer={
              <div className="d-flex justify-content-between small">
                <span className="text-danger">
                  Admin: <strong>{displayStats.users.admin}</strong>
                </span>
                <span className="text-warning">
                  Author: <strong>{displayStats.users.author}</strong>
                </span>
                <span className="text-info">
                  User: <strong>{displayStats.users.user}</strong>
                </span>
              </div>
            }
          />
        </Col>

        {/* Tags Card */}
        <Col>
          <BaseCard.Stats
            title="Tags"
            value={displayStats.tags.total}
            icon={BsTag}
            footer={
              <small className="text-muted">
                Used to categorize and organize articles
              </small>
            }
          />
        </Col>

        {/* Views Card */}
        <Col>
          <BaseCard.Stats
            title="Total Views"
            value={displayStats.views.total}
            icon={BsEye}
            footer={
              <div className="text-center">
                <small className="text-muted">
                  Aggregate views across all articles
                </small>
              </div>
            }
          />
        </Col>

        {/* System Status Card */}
        <Col>
          <BaseCard
            title="System Status"
            height="full"
            className="stats-card"
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">
                  <span className="badge bg-success">Operational</span>
                </h3>
              </div>
              <BsArrowUp size={40} className="text-success opacity-75" />
            </div>
            <hr />
            <div className="text-center">
              <small className="text-muted">
                All systems functioning normally
              </small>
            </div>
          </BaseCard>
        </Col>
      </Row>

      {/* Recent Activity */}
      <BaseCard
        header={
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent Activity</h5>
            <small className="text-muted">Last 10 activities</small>
          </div>
        }
        padding={false}
      >
          {displayActivity.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0">
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
                  {displayActivity.map((activity, index) => (
                    <tr key={`${activity.type}-${activity.id}-${index}`}>
                      <td>
                        <span className="badge bg-secondary text-capitalize">
                          {activity.type}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${getActivityBadge(
                            activity.type,
                            activity.action
                          )}`}
                        >
                          {activity.action}
                        </span>
                      </td>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: "300px" }}
                      >
                        {activity.title}
                      </td>
                      <td>{activity.user}</td>
                      <td className="text-nowrap">
                        {moment(activity.timestamp).fromNow()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <BsChatSquareText size={40} className="mb-3 opacity-50" />
              <p className="mb-0">No recent activity to display</p>
            </div>
          )}
      </BaseCard>
    </div>
  );
};

export default DashboardPage;
