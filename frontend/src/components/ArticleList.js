// frontend/src/components/articles/ArticleList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Pagination, Button } from "react-bootstrap";
import { BsFillHeartFill, BsEye, BsChat } from "react-icons/bs";
import axios from "axios";
import moment from "moment";
import { API_URL } from "../../config";
import "./ArticleList.scss";

const ArticleList = ({ tag, search }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // Articles per page

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        // Build query parameters
        let url = `${API_URL}/articles?page=${page}&limit=${limit}`;

        if (tag) {
          url += `&tag=${tag}`;
        }

        if (search) {
          url += `&search=${search}`;
        }

        const res = await axios.get(url);

        setArticles(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page, tag, search]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No articles found. {search && "Try a different search term."}
        {tag && "No articles with this tag yet."}
      </div>
    );
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <Card key={article.id} className="mb-4 article-card">
          {article.featured_image && (
            <div className="article-image-container">
              <img
                src={article.featured_image}
                className="card-img-top article-image"
                alt={article.title}
              />
            </div>
          )}

          <Card.Body>
            <div className="d-flex justify-content-between mb-2">
              <div className="article-tags">
                {article.tags.map((tag) => (
                  <Link to={`/tags/${tag.slug}`} key={tag.id}>
                    <Badge bg="secondary" className="me-1">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <small className="text-muted">
                {moment(article.published_at).format("MMM D, YYYY")}
              </small>
            </div>

            <Card.Title>
              <Link to={`/articles/${article.slug}`} className="article-title">
                {article.title}
              </Link>
            </Card.Title>

            <Card.Text className="article-excerpt">{article.excerpt}</Card.Text>

            <div className="d-flex justify-content-between align-items-center">
              <div className="article-meta">
                <span className="me-3" title="Views">
                  <BsEye className="me-1" />
                  {article.view_count}
                </span>
                <span className="me-3" title="Likes">
                  <BsFillHeartFill className="me-1" />
                  {article.like_count || 0}
                </span>
                <span title="Comments">
                  <BsChat className="me-1" />
                  {article.comments?.length || 0}
                </span>
              </div>

              <div className="d-flex align-items-center">
                {article.author && (
                  <div className="author-info me-3">
                    <small className="text-muted">By</small>
                    <Link
                      to={`/author/${article.author.username}`}
                      className="ms-1 author-name"
                    >
                      {article.author.first_name} {article.author.last_name}
                    </Link>
                  </div>
                )}

                <Link to={`/articles/${article.slug}`}>
                  <Button variant="primary" size="sm">
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            />

            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === page}
                onClick={() => handlePageChange(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
