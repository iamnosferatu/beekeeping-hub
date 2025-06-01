// frontend/src/components/debug/RelatedArticlesDebugger.js
import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import RelatedArticles from '../articles/RelatedArticles';
import apiService from '../../services/api';

const RelatedArticlesDebugger = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await apiService.articles.getAll({ limit: 10 });
        if (response.success && response.data) {
          setArticles(response.data.data || response.data);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const testRelatedArticlesAPI = async (articleId) => {
    try {
      setApiResponse(null);
      setError(null);
      console.log('Testing related articles for article ID:', articleId);
      
      const response = await apiService.articles.getRelated(articleId, 5);
      console.log('API Response:', response);
      setApiResponse(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'API request failed');
    }
  };

  if (loading) {
    return <Container className="my-5"><p>Loading articles...</p></Container>;
  }

  return (
    <Container className="my-5">
      <h1>Related Articles Debugger</h1>
      
      <Card className="my-4">
        <Card.Header>
          <h3>Step 1: Select an Article</h3>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-column gap-2">
            {articles.map(article => (
              <Button
                key={article.id}
                variant={selectedArticle?.id === article.id ? 'primary' : 'outline-primary'}
                onClick={() => {
                  setSelectedArticle(article);
                  testRelatedArticlesAPI(article.id);
                }}
              >
                {article.title} (ID: {article.id})
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {selectedArticle && (
        <>
          <Card className="my-4">
            <Card.Header>
              <h3>Step 2: API Response</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {apiResponse && (
                <pre className="bg-light p-3 rounded">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              )}
            </Card.Body>
          </Card>

          <Card className="my-4">
            <Card.Header>
              <h3>Step 3: Component Render</h3>
            </Card.Header>
            <Card.Body>
              <RelatedArticles articleId={selectedArticle.id} limit={5} />
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default RelatedArticlesDebugger;