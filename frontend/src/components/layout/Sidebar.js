// frontend/src/components/layout/Sidebar.js
import React, { useState, useEffect } from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [tags, setTags] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoading(true);

        // For now, use placeholder data instead of API calls
        setTags([
          { id: 1, name: "Beginner", slug: "beginner", count: 8 },
          { id: 2, name: "Advanced", slug: "advanced", count: 5 },
          { id: 3, name: "Equipment", slug: "equipment", count: 7 },
          { id: 4, name: "Honey", slug: "honey", count: 4 },
          { id: 5, name: "Health", slug: "health", count: 3 },
          { id: 6, name: "Seasonal", slug: "seasonal", count: 2 },
        ]);

        setRecentArticles([
          {
            id: 1,
            title: "Getting Started with Beekeeping",
            slug: "getting-started-with-beekeeping",
          },
          {
            id: 2,
            title: "Honey Harvesting Techniques",
            slug: "honey-harvesting-techniques",
          },
          {
            id: 3,
            title: "Common Bee Diseases and Prevention",
            slug: "common-bee-diseases-and-prevention",
          },
          {
            id: 4,
            title: "The Perfect Beehive Setup",
            slug: "the-perfect-beehive-setup",
          },
        ]);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  return (
    <>
      {/* Popular Tags */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Popular Tags</h5>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="text-center">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  to={`/tags/${tag.slug}`}
                  key={tag.id}
                  className="text-decoration-none"
                >
                  <Badge bg="secondary" className="p-2">
                    {tag.name}{" "}
                    <span className="badge bg-light text-dark ms-1">
                      {tag.count}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Recent Articles */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Articles</h5>
        </Card.Header>

        <ListGroup variant="flush">
          {loading ? (
            <ListGroup.Item className="text-center py-3">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </ListGroup.Item>
          ) : (
            recentArticles.map((article) => (
              <ListGroup.Item key={article.id}>
                <Link
                  to={`/articles/${article.slug}`}
                  className="text-decoration-none"
                >
                  {article.title}
                </Link>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card>

      {/* Newsletter Signup (Optional) */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Newsletter</h5>
        </Card.Header>

        <Card.Body>
          <p>
            Subscribe to our newsletter for the latest beekeeping tips and news.
          </p>
          <form>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Your email"
                aria-label="Email address"
              />
              <button className="btn btn-primary" type="submit">
                Subscribe
              </button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </>
  );
};

export default Sidebar;
