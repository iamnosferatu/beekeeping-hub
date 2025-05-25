// frontend/src/components/articles/ArticleList/EmptyState.js
import React from "react";
import { Alert, Button } from "react-bootstrap";
import { BsFileEarmarkText, BsSearch, BsTag } from "react-icons/bs";
import { Link } from "react-router-dom";

/**
 * EmptyState Component
 *
 * Displays appropriate empty state messages when no articles are found.
 * Provides context-aware messaging and helpful actions based on current filters.
 */
const EmptyState = ({ search, tag }) => {
  /**
   * Get appropriate icon based on the context
   */
  const getIcon = () => {
    if (search) return <BsSearch size={48} className="text-muted mb-3" />;
    if (tag) return <BsTag size={48} className="text-muted mb-3" />;
    return <BsFileEarmarkText size={48} className="text-muted mb-3" />;
  };

  /**
   * Get contextual title based on current filters
   */
  const getTitle = () => {
    if (search && tag) {
      return `No Articles Found for "${search}" in "${tag}"`;
    }
    if (search) {
      return `No Articles Found for "${search}"`;
    }
    if (tag) {
      return `No Articles Tagged "${tag}"`;
    }
    return "No Articles Available";
  };

  /**
   * Get contextual message based on current filters
   */
  const getMessage = () => {
    if (search && tag) {
      return `Try searching with different keywords or browse articles in other categories.`;
    }
    if (search) {
      return `Try searching with different keywords or browse all articles.`;
    }
    if (tag) {
      return `No articles have been tagged with "${tag}" yet. Check back later or browse other topics.`;
    }
    return "No articles have been published yet. Check back later for new content.";
  };

  /**
   * Get suggested actions based on context
   */
  const getSuggestedActions = () => {
    const actions = [];

    // Always show "Browse All Articles" unless we're already showing all
    if (search || tag) {
      actions.push(
        <Button
          key="browse-all"
          variant="primary"
          as={Link}
          to="/articles"
          className="me-2"
        >
          Browse All Articles
        </Button>
      );
    }

    // Show "View Tags" if not already filtering by tag
    if (!tag) {
      actions.push(
        <Button
          key="view-tags"
          variant="outline-secondary"
          as={Link}
          to="/tags"
        >
          <BsTag className="me-1" />
          Browse by Topic
        </Button>
      );
    }

    // If no other actions, show home button
    if (actions.length === 0) {
      actions.push(
        <Button key="home" variant="primary" as={Link} to="/">
          Back to Home
        </Button>
      );
    }

    return actions;
  };

  return (
    <Alert variant="info" className="text-center py-5">
      <div className="d-flex flex-column align-items-center">
        {/* Icon */}
        {getIcon()}

        {/* Title */}
        <Alert.Heading className="h4 mb-3">{getTitle()}</Alert.Heading>

        {/* Message */}
        <p className="mb-4 text-muted">{getMessage()}</p>

        {/* Search Tips for search results */}
        {search && (
          <div className="mb-4">
            <h6 className="text-muted">Search Tips:</h6>
            <ul className="list-unstyled text-muted small">
              <li>• Try different or more general keywords</li>
              <li>• Check your spelling</li>
              <li>• Use fewer search terms</li>
              <li>• Browse articles by topic instead</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {getSuggestedActions()}
        </div>
      </div>
    </Alert>
  );
};

export default EmptyState;
