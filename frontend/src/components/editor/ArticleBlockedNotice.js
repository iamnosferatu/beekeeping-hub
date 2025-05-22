// frontend/src/components/editor/ArticleBlockedNotice.js
import React from "react";
import { Alert } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";
import moment from "moment";

const ArticleBlockedNotice = ({ article }) => {
  if (!article.blocked) {
    return null;
  }

  return (
    <Alert variant="danger" className="d-flex align-items-start mb-4">
      <div className="me-3 mt-1">
        <BsExclamationTriangle size={24} />
      </div>
      <div>
        <Alert.Heading>This Article Has Been Blocked</Alert.Heading>
        <p>
          <strong>Reason:</strong>{" "}
          {article.blocked_reason || "No specific reason provided."}
        </p>
        <p>
          <strong>Blocked by:</strong> {article.blocked_by?.first_name}{" "}
          {article.blocked_by?.last_name || "Administrator"}
          <br />
          <strong>Blocked on:</strong>{" "}
          {article.blocked_at
            ? moment(article.blocked_at).format("MMMM D, YYYY [at] h:mm A")
            : "Unknown date"}
        </p>
      </div>
    </Alert>
  );
};

export default ArticleBlockedNotice;
