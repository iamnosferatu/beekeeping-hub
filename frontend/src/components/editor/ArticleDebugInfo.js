// frontend/src/components/editor/ArticleDebugInfo.js
import React from "react";
import { Card } from "react-bootstrap";

const ArticleDebugInfo = ({ debugInfo }) => {
  if (!debugInfo || process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="mt-3 bg-dark">
      <Card.Header>Debug Information</Card.Header>
      <Card.Body>
        <pre
          style={{ fontSize: "0.8rem", maxHeight: "300px", overflow: "auto" }}
        >
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </Card.Body>
    </Card>
  );
};

export default ArticleDebugInfo;
