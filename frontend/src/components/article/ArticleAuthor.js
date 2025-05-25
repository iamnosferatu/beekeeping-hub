// frontend/src/components/article/ArticleAuthor.js
import React, { useContext } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsShareFill } from "react-icons/bs";
import AuthContext from "../../contexts/AuthContext";

const ArticleAuthor = ({ article }) => {
  const { user } = useContext(AuthContext);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Article URL copied to clipboard!");
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Row>
          <Col md={8}>
            {article.author && (
              <div className="d-flex align-items-center">
                <img
                  src={
                    article.author.avatar || "https://via.placeholder.com/60"
                  }
                  alt={`${article.author.first_name} ${article.author.last_name}`}
                  className="rounded-circle me-3"
                  width="60"
                  height="60"
                />
                <div>
                  <h5 className="mb-1">
                    {article.author.first_name} {article.author.last_name}
                  </h5>
                  <p className="text-muted mb-0">
                    {article.author.bio || "Beekeeping enthusiast and writer"}
                  </p>
                </div>
              </div>
            )}
          </Col>
          <Col md={4}>
            <div className="d-flex justify-content-md-end mt-3 mt-md-0">
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={handleShare}
              >
                <BsShareFill className="me-1" /> Share
              </Button>
              {user && user.id === article.author?.id && (
                <Link to={`/editor/${article.id}`}>
                  <Button variant="outline-secondary">Edit Article</Button>
                </Link>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ArticleAuthor;
