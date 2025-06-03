import React, { useState, useEffect } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaComments, FaClock, FaUser } from 'react-icons/fa';
import { useForum } from '../../hooks/api/useForum';
import LoadingSpinner from '../common/LoadingSpinner';

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
  }, []);

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

  /**
   * Format time ago for last activity
   */
  const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Recent Threads</h5>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <LoadingSpinner size="sm" />
        </Card.Body>
      </Card>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Recent Threads</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-0">No threads yet.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Recent Threads</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {threads.map((thread) => (
          <ListGroup.Item key={thread.id} className="px-3 py-2">
            <Link 
              to={`/forum/threads/${thread.slug}`}
              className="text-decoration-none d-block"
            >
              <h6 className="mb-1 text-dark">
                {thread.isPinned && <span className="text-primary me-1">📌</span>}
                {thread.title}
              </h6>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <FaUser className="me-1" />
                  {thread.author?.username || 'Unknown'}
                </small>
                <small className="text-muted">
                  <FaComments className="me-1" />
                  {thread.commentCount || 0}
                </small>
              </div>
              <small className="text-muted">
                <FaClock className="me-1" />
                {formatTimeAgo(thread.lastActivityAt || thread.last_activity_at || thread.created_at)}
              </small>
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Card.Footer className="text-center">
        <Link to="/forum" className="btn btn-sm btn-outline-primary">
          View All Threads
        </Link>
      </Card.Footer>
    </Card>
  );
};

export default RecentThreads;