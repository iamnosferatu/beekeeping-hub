// frontend/src/components/articles/ArticleList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Badge,
  Pagination,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
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
        setError(null);

        // Build query parameters
        let url = `${API_URL}/articles?page=${page}&limit=${limit}`;

        if (tag) {
          url += `&tag=${tag}`;
        }

        if (search) {
          url += `&search=${search}`;
        }

        // First, try to get from the real API
        try {
          const res = await axios.get(url);

          if (res.data.success) {
            setArticles(res.data.data);
            setTotalPages(res.data.pagination.totalPages);
          } else {
            throw new Error("Failed to fetch articles");
          }
        } catch (apiError) {
          console.warn("API error, using fallback data:", apiError);

          // Fallback to mock data for development (similar to what was in the original file)
          const mockArticles = [
            {
              id: 1,
              title: "Getting Started with Beekeeping",
              slug: "getting-started-with-beekeeping",
              excerpt:
                "Learn the basics of beekeeping, including essential equipment, selecting bees, and choosing the right location for your hives.",
              published_at: "2023-05-15T10:30:00Z",
              view_count: 215,
              like_count: 42,
              comments: [1, 2, 3],
              author: {
                id: 1,
                username: "author1",
                first_name: "Jane",
                last_name: "Beekeeper",
              },
              tags: [
                { id: 1, name: "Beginner", slug: "beginner" },
                { id: 3, name: "Equipment", slug: "equipment" },
              ],
            },
            {
              id: 2,
              title: "Honey Harvesting Techniques",
              slug: "honey-harvesting-techniques",
              excerpt:
                "Master the art of honey harvesting with these proven techniques. Learn when to harvest, what equipment to use, and how to extract honey without harming your bees.",
              published_at: "2023-05-30T14:45:00Z",
              view_count: 178,
              like_count: 36,
              comments: [4, 5],
              author: {
                id: 1,
                username: "author1",
                first_name: "Jane",
                last_name: "Beekeeper",
              },
              tags: [
                { id: 2, name: "Advanced", slug: "advanced" },
                { id: 4, name: "Honey", slug: "honey" },
              ],
            },
            {
              id: 3,
              title: "Common Bee Diseases and Prevention",
              slug: "common-bee-diseases-and-prevention",
              excerpt:
                "Learn to identify and prevent common bee diseases including Varroa mites, foulbrood, and nosema. Protecting your bees from these threats is essential for colony survival.",
              published_at: "2023-06-10T09:15:00Z",
              view_count: 143,
              like_count: 28,
              comments: [],
              author: {
                id: 2,
                username: "author2",
                first_name: "John",
                last_name: "Hiveman",
              },
              tags: [{ id: 5, name: "Health", slug: "health" }],
            },
            {
              id: 4,
              title: "The Perfect Beehive Setup",
              slug: "the-perfect-beehive-setup",
              excerpt:
                "Design the ideal home for your bees with this comprehensive guide to beehive setup. Learn about different hive types, optimal positioning, and seasonal configurations.",
              published_at: "2023-07-05T16:20:00Z",
              view_count: 97,
              like_count: 18,
              comments: [],
              author: {
                id: 1,
                username: "author1",
                first_name: "Jane",
                last_name: "Beekeeper",
              },
              tags: [
                { id: 1, name: "Beginner", slug: "beginner" },
                { id: 3, name: "Equipment", slug: "equipment" },
              ],
            },
          ];

          // Filter mock data if needed
          let filteredArticles = mockArticles;

          if (tag) {
            filteredArticles = filteredArticles.filter((article) =>
              article.tags.some((t) => t.slug === tag)
            );
          }

          if (search) {
            const searchLower = search.toLowerCase();
            filteredArticles = filteredArticles.filter(
              (article) =>
                article.title.toLowerCase().includes(searchLower) ||
                article.excerpt.toLowerCase().includes(searchLower)
            );
          }

          setArticles(filteredArticles);
          setTotalPages(1); // Just 1 page for mock data
        }
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
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (articles.length === 0) {
    return (
      <Alert variant="info" className="mb-4">
        <Alert.Heading>No Articles Found</Alert.Heading>
        <p>
          {search
            ? `No articles matching "${search}". Try a different search term.`
            : tag
            ? `No articles with the tag "${tag}" found.`
            : "No articles available at the moment."}
        </p>
      </Alert>
    );
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <Card key={article.id} className="mb-4 article-card shadow-sm">
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
                {article.tags &&
                  article.tags.map((tag) => (
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
                  {article.view_count || 0}
                </span>
                <span className="me-3" title="Likes">
                  <BsFillHeartFill className="me-1" />
                  {article.like_count || 0}
                </span>
                <span title="Comments">
                  <BsChat className="me-1" />
                  {article.comments ? article.comments.length : 0}
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
