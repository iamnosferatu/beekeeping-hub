// frontend/src/components/article/ArticleHeader.js
import React, { useState, useContext } from "react";
import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BsFillHeartFill,
  BsEye,
  BsChat,
  BsPerson,
  BsCalendar3,
} from "react-icons/bs";
import moment from "moment";
import AuthContext from "../../contexts/AuthContext";
import { useToggleArticleLike } from "../../hooks/api/useArticles";

const ArticleHeader = ({ article }) => {
  const { user } = useContext(AuthContext);
  const [liked, setLiked] = useState(
    article.likes?.some((like) => like.user_id === user?.id) || false
  );
  const [likeCount, setLikeCount] = useState(article.like_count || 0);

  const { mutate: toggleLike } = useToggleArticleLike({
    onSuccess: () => {
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
    },
  });

  const handleLikeToggle = () => {
    if (!user) {
      // Redirect to login if needed
      window.location.href = `/login?redirect=/articles/${article.slug}`;
      return;
    }
    toggleLike(article.id);
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      {article.featured_image && (
        <div className="article-image-container">
          <img
            src={article.featured_image}
            className="card-img-top article-featured-image"
            alt={article.title}
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
        </div>
      )}

      <Card.Body>
        {/* Tags */}
        <div className="mb-2">
          {article.tags?.map((tag) => (
            <Link
              to={`/tags/${tag.slug}`}
              key={tag.id}
              className="text-decoration-none"
            >
              <Badge bg="secondary" className="me-2 mb-1 p-2">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="article-title mb-3">{article.title}</h1>

        {/* Meta information */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div className="article-meta d-flex align-items-center mb-2 mb-md-0">
            <BsPerson className="me-1" />
            {article.author ? (
              <Link
                to={`/author/${article.author.username}`}
                className="me-3 author-name"
              >
                {article.author.first_name} {article.author.last_name}
              </Link>
            ) : (
              <span className="me-3">Unknown Author</span>
            )}

            <BsCalendar3 className="me-1" />
            <span className="me-3">
              {article.published_at &&
                moment(article.published_at).format("MMM D, YYYY")}
            </span>
          </div>

          <div className="article-stats d-flex align-items-center">
            <span className="me-3" title="Views">
              <BsEye className="me-1" />
              {article.view_count || 0}
            </span>
            <span
              className={`me-3 ${liked ? "text-danger" : ""}`}
              onClick={handleLikeToggle}
              style={{ cursor: "pointer" }}
              title={liked ? "Unlike" : "Like"}
            >
              <BsFillHeartFill className="me-1" />
              {likeCount}
            </span>
            <span title="Comments">
              <BsChat className="me-1" />
              {article.comments ? article.comments.length : 0}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleHeader;
