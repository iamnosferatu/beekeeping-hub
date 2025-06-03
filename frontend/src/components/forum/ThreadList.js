import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, ListGroup } from 'react-bootstrap';
import { FaUser, FaClock, FaComment, FaEye, FaThumbtack, FaLock } from 'react-icons/fa';
import Avatar from '../common/Avatar';
import './ForumComponents.scss';

const ThreadList = ({ threads, showCategory = false }) => {
  if (!threads || threads.length === 0) {
    return (
      <Card className="text-center py-5">
        <Card.Body>
          <h5 className="text-muted">No threads in this category yet</h5>
          <p className="text-muted">Be the first to start a discussion!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <ListGroup variant="flush" className="forum-thread-list">
      {threads.map((thread) => (
        <ListGroup.Item key={thread.id} className="thread-item">
          <div className="d-flex align-items-start">
            <Avatar
              user={thread.author}
              size={48}
              className="me-3 d-none d-md-block"
            />
            
            <div className="flex-grow-1">
              <div className="thread-header">
                <h5 className="thread-title mb-1">
                  {thread.isPinned && (
                    <FaThumbtack className="text-primary me-2" title="Pinned" />
                  )}
                  <Link 
                    to={`/forum/threads/${thread.slug}`} 
                    className="text-decoration-none"
                  >
                    {thread.title}
                  </Link>
                  {thread.isLocked && (
                    <Badge bg="warning" className="ms-2">
                      <FaLock /> Locked
                    </Badge>
                  )}
                  {thread.isBlocked && (
                    <Badge bg="danger" className="ms-2">
                      Blocked
                    </Badge>
                  )}
                </h5>
                
                <div className="thread-meta text-muted small">
                  <span className="me-3">
                    <FaUser className="me-1" />
                    {thread.author?.username || 'Unknown'}
                  </span>
                  {showCategory && thread.category && (
                    <span className="me-3">
                      in <Link to={`/forum/categories/${thread.category.slug}`}>
                        {thread.category.name}
                      </Link>
                    </span>
                  )}
                  <span className="me-3">
                    <FaClock className="me-1" />
                    {new Date(thread.lastActivityAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="thread-stats text-end ms-3">
              <div className="stat-item">
                <FaComment className="text-muted me-1" />
                <span>{thread.commentCount || 0}</span>
              </div>
              <div className="stat-item">
                <FaEye className="text-muted me-1" />
                <span>{thread.viewCount || 0}</span>
              </div>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default ThreadList;