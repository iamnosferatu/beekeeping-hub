// frontend/src/pages/ArticlePageDebug.js - Debug version of ArticlePage
import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Spinner, Alert, Button, Row, Col } from "react-bootstrap";
import { useArticleBySlug } from "../hooks/api/useArticles";
import ArticleHeader from "../components/articles/ArticleHeader";
import ArticleContent from "../components/articles/ArticleContent";
import NestedCommentsSection from "../components/articles/Comments/NestedCommentsSection";
import RelatedArticles from "../components/articles/RelatedArticles";
import "./ArticlePage.scss";

const ArticlePageDebug = () => {
  const { slug } = useParams();
  const { data: article, loading, error } = useArticleBySlug(slug);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ArticlePageDebug - Component mounted');
    console.log('🔍 Slug:', slug);
  }, [slug]);

  useEffect(() => {
    console.log('🔍 Article data:', article);
    if (article) {
      const articleData = article?.data || article;
      console.log('🔍 Article ID:', articleData?.id);
      console.log('🔍 Article Title:', articleData?.title);
    }
  }, [article]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading article...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading article...</p>
      </Container>
    );
  }

  if (error) {
    console.error('🔍 Error loading article:', error);
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Article</Alert.Heading>
          <p>{error.message || "Failed to load article. Please try again."}</p>
          <div className="d-flex justify-content-end">
            <Link to="/articles">
              <Button variant="outline-danger">Back to Articles</Button>
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  const articleData = article?.data || article;

  if (!articleData || !articleData.title) {
    console.error('🔍 No article data found');
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Article Not Found</Alert.Heading>
          <p>
            The article you're looking for doesn't exist or has been removed.
          </p>
          <div className="d-flex justify-content-end">
            <Link to="/articles">
              <Button variant="outline-warning">Browse Articles</Button>
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  console.log('🔍 Rendering article with ID:', articleData.id);

  return (
    <div className="article-page">
      <ArticleHeader article={articleData} />
      <ArticleContent article={articleData} />

      {/* Debug info */}
      <Container className="my-4">
        <Row>
          <Col lg={8} className="mx-auto">
            <div className="bg-light p-3 rounded mb-3">
              <h5>Debug Info:</h5>
              <p>Article ID: {articleData.id}</p>
              <p>Article Slug: {articleData.slug}</p>
              <p>Tags: {articleData.tags?.map(t => t.name).join(', ') || 'No tags'}</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Related Articles Section */}
      <Container className="my-4">
        <Row>
          <Col lg={8} className="mx-auto">
            {console.log('🔍 Rendering RelatedArticles with articleId:', articleData.id)}
            <RelatedArticles articleId={articleData.id} limit={5} />
          </Col>
        </Row>
      </Container>

      <NestedCommentsSection
        articleId={articleData.id}
        initialComments={articleData.comments || []}
        showCommentForm={true}
      />
    </div>
  );
};

export default ArticlePageDebug;