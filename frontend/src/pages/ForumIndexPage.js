import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Alert, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { BsChatSquareDots } from 'react-icons/bs';
import AuthContext from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useForum } from '../hooks/api/useForum';
import CategoryList from '../components/forum/CategoryList';
import CategoryForm from '../components/forum/CategoryForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * ForumIndexPage Component
 * 
 * Main forum index page that displays all forum categories.
 * Requires user authentication and checks if forum feature is enabled.
 * Follows the same pattern as ArticleListPage for consistency.
 */
const ForumIndexPage = () => {
  const { user } = useContext(AuthContext);
  const { settings } = useSiteSettings();
  const { getCategories, canCreateCategory, loading, error } = useForum();
  
  const [categories, setCategories] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Fetches forum categories from the API
   * Handles loading state and error cases
   */
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  /**
   * Handles successful category creation
   * Adds new category to the beginning of the list
   * @param {Object} newCategory - The newly created category object
   */
  const handleCategoryCreated = (newCategory) => {
    setCategories([newCategory, ...categories]);
    setShowCreateForm(false);
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

  // Check if user is logged in
  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Login Required</h4>
          <p>You need to be logged in to access the forum.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Forum</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-4">
                <BsChatSquareDots className="me-3" />
                Community Forum
              </h1>
              <p className="lead text-muted">
                Join discussions about beekeeping and share your experiences
              </p>
            </div>
            
            {canCreateCategory() && !showCreateForm && (
              <Button 
                variant="primary" 
                onClick={() => setShowCreateForm(true)}
                className="d-flex align-items-center"
              >
                <FaPlus className="me-2" />
                New Category
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}

      {showCreateForm && (
        <Row className="mb-4">
          <Col lg={8}>
            <CategoryForm
              onSuccess={handleCategoryCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </Col>
        </Row>
      )}

      {loadingCategories ? (
        <LoadingSpinner />
      ) : (
        <CategoryList categories={categories} loading={loading} />
      )}
    </Container>
  );
};

export default ForumIndexPage;