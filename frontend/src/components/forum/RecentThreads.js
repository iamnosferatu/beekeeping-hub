import React, { useState, useEffect } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForum } from '../../hooks/api/useForum';
import LoadingIndicator from '../common/LoadingIndicator';

/**
 * RecentThreads Component
 * 
 * Displays a list of recent forum threads in the sidebar.
 * Shows thread title, author, comment count, and last activity time.
 */
const RecentThreads = ({ limit = 5 }) => {
  const { getThreads } = useForum();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentThreads();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecentThreads = async () => {
    try {
      setLoading(true);
      const response = await getThreads({ limit, sort: 'recent' });
      // Handle the response structure
      if (response && response.data) {
        setThreads(response.data);
      } else if (Array.isArray(response)) {
        setThreads(response);
      } else {
        setThreads([]);
      }
    } catch (error) {
      console.error('Failed to fetch recent threads:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Threads</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-3">
            <LoadingIndicator size="sm" showMessage={false} inline />
            <p className="mt-2 mb-0 small text-muted">Loading threads...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Threads</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-0 text-center">
            <small>No recent threads available</small>
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header>
        <h5 className="mb-0">Recent Threads</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {threads.map((thread) => (
          <ListGroup.Item
            key={thread.id}
            className="px-3 py-2"
            style={{
              transition: "background-color 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Link
              to={`/forum/threads/${thread.slug}`}
              className="text-decoration-none d-block"
              title={thread.title}
            >
              <div className="text-truncate">
                {thread.isPinned && <span className="text-primary me-1">📌</span>}
                {thread.title}
              </div>
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
      {threads.length > 0 && (
        <Card.Footer className="text-center">
          <Link to="/forum" className="text-decoration-none small">
            View all threads →
          </Link>
        </Card.Footer>
      )}
    </Card>
  );
};

export default RecentThreads;