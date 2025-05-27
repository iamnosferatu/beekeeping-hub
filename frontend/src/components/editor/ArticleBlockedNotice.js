// frontend/src/components/editor/ArticleBlockedNotice.js
import React from "react";
import { Alert } from "react-bootstrap";
import { BsShieldExclamation } from "react-icons/bs";
import moment from "moment";

/**
 * ArticleBlockedNotice Component
 *
 * Displays a warning notice if the article has been blocked by an administrator
 */
const ArticleBlockedNotice = ({ article }) => {
  // Don't show if article is not blocked
  if (!article || !article.blocked) {
    return null;
  }

  return (
    <Alert variant="danger" className="mb-4">
      <div className="d-flex align-items-start">
        <BsShieldExclamation size={24} className="me-3 flex-shrink-0" />
        <div>
          <Alert.Heading className="h5">Article Blocked</Alert.Heading>
          <p className="mb-2">
            This article has been blocked by an administrator and is not visible
            to the public.
          </p>

          {article.blocked_reason && (
            <div className="mb-2">
              <strong>Reason:</strong> {article.blocked_reason}
            </div>
          )}

          <div className="small text-muted">
            {article.blocked_by && (
              <span>
                Blocked by: {article.blocked_by.first_name}{" "}
                {article.blocked_by.last_name}
              </span>
            )}
            {article.blocked_at && (
              <span className="ms-3">
                on {moment(article.blocked_at).format("MMMM D, YYYY")}
              </span>
            )}
          </div>

          <hr />

          <p className="mb-0 small">
            You can still edit this article, but it will remain hidden from
            public view until an administrator removes the block. Please address
            the issues mentioned above and contact an administrator when ready.
          </p>
        </div>
      </div>
    </Alert>
  );
};

export default ArticleBlockedNotice;
