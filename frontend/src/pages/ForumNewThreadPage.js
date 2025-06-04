import React, { useState, useEffect, useContext } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useForum } from '../hooks/api/useForum';
import ThreadForm from '../components/forum/ThreadForm';
import LoadingIndicator from '../components/common/LoadingIndicator';
import { SEO } from '../contexts/SEOContext';

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    return <LoadingIndicator message="Loading categories..." />;
  }

  return (
    <>
      <SEO 
        title="Create New Thread"
        description="Start a new discussion in the BeeKeeper's Hub community forum. Share your beekeeping experiences, ask questions, or discuss topics with fellow beekeepers."
        type="website"
      />
      <Container className="py-4">
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
    </>
  );
};

export default ForumNewThreadPage;