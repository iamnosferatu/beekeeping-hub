import React, { useState, useEffect, useContext } from 'react';
import { Container, Breadcrumb, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import AuthContext from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useForum } from '../hooks/api/useForum';
import ThreadForm from '../components/forum/ThreadForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ForumNewThreadPage = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { settings } = useSiteSettings();
  const { getCategories, canCreateThread } = useForum();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get categoryId from location state if navigated from a category page
  const defaultCategoryId = location.state?.categoryId;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      setError(error.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
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

  // Check if user can create threads
  if (!canCreateThread()) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Permission Required</h4>
          <p>Only authors and admins can create new threads.</p>
          {!user ? (
            <Link to="/login" className="btn btn-primary">Login</Link>
          ) : (
            <Link to="/author-application" className="btn btn-primary">
              Apply to Become an Author
            </Link>
          )}
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
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
        <Breadcrumb.Item active>New Thread</Breadcrumb.Item>
      </Breadcrumb>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ThreadForm 
        categories={categories} 
        defaultCategoryId={defaultCategoryId}
      />
    </Container>
  );
};

export default ForumNewThreadPage;