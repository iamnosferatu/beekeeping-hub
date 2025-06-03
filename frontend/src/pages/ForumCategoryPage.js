import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Alert, Breadcrumb, Card } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaHome } from 'react-icons/fa';
import AuthContext from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useForum } from '../hooks/api/useForum';
import ThreadList from '../components/forum/ThreadList';
import CategoryForm from '../components/forum/CategoryForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/ui/Pagination';

/**
 * ForumCategoryPage Component
 * 
 * Displays a single forum category with its threads.
 * Allows authorized users to edit/delete the category and create new threads.
 * Implements pagination for threads list.
 */
const ForumCategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { settings } = useSiteSettings();
  const { 
    getCategory, 
    getThreads, 
    deleteCategory,
    canCreateThread, 
    canEditContent,
    canDeleteContent,
    loading 
  } = useForum();
  
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1); // Track current page separately
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryData();
  }, [slug, currentPage]); // Use currentPage instead of pagination.page

  const fetchCategoryData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      // Fetch category details and threads
      const response = await getCategory(slug);
      
      // The API returns both category and threads in one call
      if (response && response.category) {
        setCategory(response.category);
        setThreads(response.threads || []);
        
        // Since the getCategory endpoint returns threads directly,
        // we'll handle pagination differently
        const threadsPerPage = 20;
        const totalThreads = response.threads?.length || 0;
        setPagination({
          page: currentPage,
          pages: Math.ceil(totalThreads / threadsPerPage),
          total: totalThreads
        });
      } else {
        setError('Invalid category data received');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch category data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategory(updatedCategory);
    setShowEditForm(false);
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(category.id);
      navigate('/forum');
    } catch (error) {
      setError(error.message || 'Failed to delete category');
    }
    setShowDeleteConfirm(false);
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
    return <LoadingSpinner />;
  }

  if (!category) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Category not found</h4>
          <p>The category you're looking for doesn't exist or has been removed.</p>
          <Link to="/forum" className="btn btn-primary">Back to Forum</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          <FaHome /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/forum' }}>
          Forum
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{category.name}</Breadcrumb.Item>
      </Breadcrumb>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {showEditForm ? (
        <Row className="mb-4">
          <Col lg={8}>
            <CategoryForm
              category={category}
              onSuccess={handleCategoryUpdated}
              onCancel={() => setShowEditForm(false)}
            />
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h1 className="h2 mb-2">{category.name}</h1>
                      {category.description && (
                        <p className="text-muted mb-0">{category.description}</p>
                      )}
                      <small className="text-muted">
                        Created by {category.creator?.username || 'Unknown'}
                      </small>
                    </div>
                    
                    <div className="d-flex gap-2">
                      {canCreateThread() && (
                        <Link 
                          to="/forum/threads/new" 
                          state={{ categoryId: category.id }}
                          className="btn btn-primary"
                        >
                          <FaPlus className="me-2" />
                          New Thread
                        </Link>
                      )}
                      
                      {canEditContent(category) && (
                        <>
                          <Button 
                            variant="outline-secondary"
                            onClick={() => setShowEditForm(true)}
                          >
                            <FaEdit />
                          </Button>
                          
                          {canDeleteContent(category) && (
                            <Button 
                              variant="outline-danger"
                              onClick={() => setShowDeleteConfirm(true)}
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <ThreadList threads={threads} />
              
              {pagination.pages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.pages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </Col>
          </Row>
        </>
      )}

      <ConfirmDialog
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${category?.name || 'this category'}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </Container>
  );
};

export default ForumCategoryPage;