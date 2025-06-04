import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Alert, Card, Badge } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaLock, FaUnlock, FaThumbtack, FaEye, FaClock } from 'react-icons/fa';
import AuthContext from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useForum } from '../hooks/api/useForum';
import useDynamicBreadcrumb from '../hooks/useDynamicBreadcrumb';
import CommentList from '../components/forum/CommentList';
import CommentForm from '../components/forum/CommentForm';
import ThreadForm from '../components/forum/ThreadForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingIndicator from '../components/common/LoadingIndicator';
import Avatar from '../components/common/Avatar';
import { SEO } from '../contexts/SEOContext';

const ForumThreadPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { settings } = useSiteSettings();
  const { 
    getThread, 
    deleteThread,
    toggleThreadLock,
    toggleThreadPin,
    canCreateComment,
    canEditContent,
    canDeleteContent
  } = useForum();
  
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  
  // Set dynamic breadcrumb for thread with category information
  useDynamicBreadcrumb({ 
    title: thread?.title,
    category: thread?.category 
  }, [thread?.title, thread?.category]);

  useEffect(() => {
    fetchThreadData();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchThreadData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      const data = await getThread(slug);
      setThread(data.thread);
      setComments(data.comments);
    } catch (error) {
      setError(error.message || 'Failed to fetch thread');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteThread = async () => {
    try {
      await deleteThread(thread.id);
      navigate(`/forum/categories/${thread.category.slug}`);
    } catch (error) {
      setError(error.message || 'Failed to delete thread');
    }
    setShowDeleteConfirm(false);
  };

  const handleToggleLock = async () => {
    try {
      await toggleThreadLock(thread.id, !thread.isLocked);
      setThread({ ...thread, isLocked: !thread.isLocked });
    } catch (error) {
      setError(error.message || 'Failed to toggle thread lock');
    }
  };

  const handleTogglePin = async () => {
    try {
      await toggleThreadPin(thread.id, !thread.isPinned);
      setThread({ ...thread, isPinned: !thread.isPinned });
    } catch (error) {
      setError(error.message || 'Failed to toggle thread pin');
    }
  };

  const handleThreadUpdated = (updatedThread) => {
    setThread(updatedThread);
    setShowEditForm(false);
  };

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(comments.map(c => 
      c.id === updatedComment.id ? updatedComment : c
    ));
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  // Check if forum is enabled
  if (!settings?.forum_enabled) {
    return (
      <Container className="py-5">
        <Alert variant="info" className="text-center">
          <h4>Forum is currently disabled</h4>
          <p>The forum feature is not available at this time.</p>
        </Alert>
      </Container>
    );
  }

  if (loadingData) {
    return <LoadingIndicator message="Loading thread..." />;
  }

  if (!thread) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Thread not found</h4>
          <p>The thread you're looking for doesn't exist or has been removed.</p>
          <Link to="/forum" className="btn btn-primary">Back to Forum</Link>
        </Alert>
      </Container>
    );
  }

  const canComment = canCreateComment() && !thread.isLocked && !thread.isBlocked;

  return (
    <>
      <SEO 
        title={thread.title}
        description={`${thread.content.substring(0, 150)}...`}
        type="article"
        author={thread.author?.username}
        publishedTime={thread.created_at || thread.createdAt}
        modifiedTime={thread.updated_at || thread.updatedAt}
      />
      <Container className="py-4 forum-thread-view">

        {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {showEditForm ? (
        <Row className="mb-4">
          <Col>
            <ThreadForm
              thread={thread}
              onCancel={() => setShowEditForm(false)}
              onSuccess={handleThreadUpdated}
            />
          </Col>
        </Row>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <div className="thread-header">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h1 className="thread-title">
                      {thread.isPinned && (
                        <FaThumbtack className="text-primary me-2" title="Pinned" />
                      )}
                      {thread.title}
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
                    </h1>
                    
                    <div className="thread-meta">
                      <span className="meta-item">
                        <Avatar user={thread.author} size={24} className="me-1" />
                        {thread.author?.username || 'Unknown'}
                      </span>
                      <span className="meta-item">
                        <FaClock className="me-1" />
                        {new Date(thread.created_at || thread.createdAt).toLocaleDateString()}
                      </span>
                      <span className="meta-item">
                        <FaEye className="me-1" />
                        {thread.view_count || thread.viewCount || 0} views
                      </span>
                    </div>
                  </div>

                  {(canEditContent(thread) || user?.role === 'admin') && (
                    <div className="d-flex gap-2">
                      {user?.role === 'admin' && (
                        <>
                          <Button
                            size="sm"
                            variant={thread.isPinned ? "warning" : "outline-warning"}
                            onClick={handleTogglePin}
                            title={thread.isPinned ? "Unpin thread" : "Pin thread"}
                          >
                            <FaThumbtack />
                          </Button>
                          <Button
                            size="sm"
                            variant={thread.isLocked ? "secondary" : "outline-secondary"}
                            onClick={handleToggleLock}
                            title={thread.isLocked ? "Unlock thread" : "Lock thread"}
                          >
                            {thread.isLocked ? <FaUnlock /> : <FaLock />}
                          </Button>
                        </>
                      )}
                      
                      {canEditContent(thread) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => setShowEditForm(true)}
                          >
                            <FaEdit />
                          </Button>
                          
                          {canDeleteContent(thread) && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setShowDeleteConfirm(true)}
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="thread-content mt-4">
                {thread.content}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Comments ({comments.length})</h5>
            </Card.Header>
            <Card.Body>
              <CommentList
                comments={comments}
                threadId={thread.id}
                onCommentAdded={handleCommentAdded}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
              />

              {canComment && (
                <div className="mt-4">
                  <h6>Add a Comment</h6>
                  <CommentForm
                    threadId={thread.id}
                    onSubmit={handleCommentAdded}
                  />
                </div>
              )}

              {thread.isLocked && (
                <Alert variant="warning" className="mt-3">
                  This thread is locked. No new comments can be added.
                </Alert>
              )}

              {!user && (
                <Alert variant="info" className="mt-3">
                  <Link to="/login">Login</Link> to participate in the discussion.
                </Alert>
              )}

              {user && user.role === 'user' && (
                <Alert variant="info" className="mt-3">
                  Only authors and admins can post comments. 
                  <Link to="/author-application" className="ms-1">Apply to become an author</Link>.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      <ConfirmDialog
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteThread}
        title="Delete Thread"
        message={`Are you sure you want to delete the thread "${thread.title}"? This will also delete all comments. This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </Container>
    </>
  );
};

export default ForumThreadPage;