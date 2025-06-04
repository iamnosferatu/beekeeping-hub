import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Alert, Badge, Button, Table } from 'react-bootstrap';
import { FaBan, FaLock, FaChartBar } from 'react-icons/fa';
import { BsChatSquareDots } from 'react-icons/bs';
import { useForum } from '../../hooks/api/useForum';
import LoadingIndicator from '../../components/common/LoadingIndicator';

const ForumManagementPage = () => {
  const {
    getForumStats,
    getBlockedContent,
    getBannedUsers,
    toggleCategoryBlock,
    toggleThreadBlock,
    toggleCommentBlock,
    toggleUserBan,
    loading
  } = useForum();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [blockedContent, setBlockedContent] = useState({ categories: [], threads: [], comments: [] });
  const [bannedUsers, setBannedUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setError(null);
      
      switch (activeTab) {
        case 'overview':
          const statsData = await getForumStats();
          setStats(statsData);
          break;
        
        case 'blocked':
          const blocked = await getBlockedContent();
          setBlockedContent(blocked);
          break;
        
        case 'banned':
          const banned = await getBannedUsers();
          setBannedUsers(banned);
          break;
          
        default:
          // No action needed for other tabs
          break;
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch data');
    }
  };

  const handleUnblockCategory = async (categoryId) => {
    try {
      await toggleCategoryBlock(categoryId, false);
      await fetchData();
    } catch (error) {
      setError(error.message || 'Failed to unblock category');
    }
  };

  const handleUnblockThread = async (threadId) => {
    try {
      await toggleThreadBlock(threadId, false);
      await fetchData();
    } catch (error) {
      setError(error.message || 'Failed to unblock thread');
    }
  };

  const handleUnblockComment = async (commentId) => {
    try {
      await toggleCommentBlock(commentId, false);
      await fetchData();
    } catch (error) {
      setError(error.message || 'Failed to unblock comment');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await toggleUserBan(userId, false);
      await fetchData();
    } catch (error) {
      setError(error.message || 'Failed to unban user');
    }
  };

  const renderOverview = () => {
    if (!stats) return LoadingIndicator.presets.dataFetch();

    return (
      <Row>
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.stats.categories.total}</h3>
              <p className="text-muted mb-0">Total Categories</p>
              {stats.stats.categories.blocked > 0 && (
                <Badge bg="danger" className="mt-2">
                  {stats.stats.categories.blocked} blocked
                </Badge>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.stats.threads.total}</h3>
              <p className="text-muted mb-0">Total Threads</p>
              {stats.stats.threads.blocked > 0 && (
                <Badge bg="danger" className="mt-2">
                  {stats.stats.threads.blocked} blocked
                </Badge>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.stats.comments.total}</h3>
              <p className="text-muted mb-0">Total Comments</p>
              {stats.stats.comments.blocked > 0 && (
                <Badge bg="danger" className="mt-2">
                  {stats.stats.comments.blocked} blocked
                </Badge>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <h3>{stats.stats.bannedUsers}</h3>
              <p className="text-muted mb-0">Banned Users</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Threads</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentActivity.threads.length === 0 ? (
                <p className="text-muted">No recent threads</p>
              ) : (
                <Table responsive hover size="sm">
                  <tbody>
                    {stats.recentActivity.threads.map(thread => (
                      <tr key={thread.id}>
                        <td>
                          <strong>{thread.title}</strong>
                          <br />
                          <small className="text-muted">
                            by {thread.author?.username} in {thread.category?.name}
                          </small>
                        </td>
                        <td className="text-end">
                          <small>{new Date(thread.created_at || thread.createdAt).toLocaleDateString()}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Comments</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentActivity.comments.length === 0 ? (
                <p className="text-muted">No recent comments</p>
              ) : (
                <Table responsive hover size="sm">
                  <tbody>
                    {stats.recentActivity.comments.map(comment => (
                      <tr key={comment.id}>
                        <td>
                          <strong>{comment.author?.username}</strong>
                          <br />
                          <small className="text-muted">
                            on "{comment.thread?.title}"
                          </small>
                        </td>
                        <td className="text-end">
                          <small>{new Date(comment.created_at || comment.createdAt).toLocaleDateString()}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderBlockedContent = () => {
    return (
      <>
        <h5 className="mb-3">Blocked Categories</h5>
        {blockedContent.categories.length === 0 ? (
          <Alert variant="info">No blocked categories</Alert>
        ) : (
          <Table responsive hover className="mb-4">
            <thead>
              <tr>
                <th>Category</th>
                <th>Created By</th>
                <th>Blocked By</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockedContent.categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.creator?.username}</td>
                  <td>{category.blocker?.username}</td>
                  <td>{category.blocked_reason || category.blockedReason}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUnblockCategory(category.id)}
                    >
                      Unblock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <h5 className="mb-3">Blocked Threads</h5>
        {blockedContent.threads.length === 0 ? (
          <Alert variant="info">No blocked threads</Alert>
        ) : (
          <Table responsive hover className="mb-4">
            <thead>
              <tr>
                <th>Thread</th>
                <th>Category</th>
                <th>Author</th>
                <th>Blocked By</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockedContent.threads.map(thread => (
                <tr key={thread.id}>
                  <td>{thread.title}</td>
                  <td>{thread.category?.name}</td>
                  <td>{thread.author?.username}</td>
                  <td>{thread.blocker?.username}</td>
                  <td>{thread.blocked_reason || thread.blockedReason}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUnblockThread(thread.id)}
                    >
                      Unblock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <h5 className="mb-3">Blocked Comments</h5>
        {blockedContent.comments.length === 0 ? (
          <Alert variant="info">No blocked comments</Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Comment</th>
                <th>Thread</th>
                <th>Author</th>
                <th>Blocked By</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockedContent.comments.map(comment => (
                <tr key={comment.id}>
                  <td className="text-truncate" style={{ maxWidth: '200px' }}>
                    {comment.content}
                  </td>
                  <td>{comment.thread?.title}</td>
                  <td>{comment.author?.username}</td>
                  <td>{comment.blocker?.username}</td>
                  <td>{comment.blocked_reason || comment.blockedReason}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUnblockComment(comment.id)}
                    >
                      Unblock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </>
    );
  };

  const renderBannedUsers = () => {
    if (bannedUsers.length === 0) {
      return <Alert variant="info">No banned users</Alert>;
    }

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Banned By</th>
            <th>Reason</th>
            <th>Banned At</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bannedUsers.map(ban => (
            <tr key={ban.id}>
              <td>{ban.bannedUser?.username}</td>
              <td>
                <Badge bg={ban.bannedUser?.role === 'admin' ? 'danger' : 'secondary'}>
                  {ban.bannedUser?.role}
                </Badge>
              </td>
              <td>{ban.bannedByUser?.username}</td>
              <td>{ban.reason}</td>
              <td>{new Date(ban.banned_at || ban.bannedAt).toLocaleDateString()}</td>
              <td>{ban.expires_at || ban.expiresAt ? new Date(ban.expires_at || ban.expiresAt).toLocaleDateString() : 'Never'}</td>
              <td>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleUnbanUser(ban.user_id || ban.userId)}
                >
                  Unban
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">
        <BsChatSquareDots className="me-2" />
        Forum Management
      </h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Card>
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="overview">
                  <FaChartBar className="me-2" />
                  Overview
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="blocked">
                  <FaLock className="me-2" />
                  Blocked Content
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="banned">
                  <FaBan className="me-2" />
                  Banned Users
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="overview">
                {renderOverview()}
              </Tab.Pane>
              <Tab.Pane eventKey="blocked">
                {loading ? LoadingIndicator.presets.dataFetch() : renderBlockedContent()}
              </Tab.Pane>
              <Tab.Pane eventKey="banned">
                {loading ? LoadingIndicator.presets.dataFetch() : renderBannedUsers()}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </Container>
  );
};

export default ForumManagementPage;