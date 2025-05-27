// frontend/src/components/editor/ArticleDebugInfo.js
import React, { useState } from "react";
import { Alert, Button, Collapse } from "react-bootstrap";
import { BsBug } from "react-icons/bs";

/**
 * ArticleDebugInfo Component
 *
 * Shows debug information in development mode to help troubleshoot issues
 */
const ArticleDebugInfo = ({ debugInfo }) => {
  const [showDebug, setShowDebug] = useState(false);

  // Only show in development mode and when debug info exists
  if (process.env.NODE_ENV !== "development" || !debugInfo) {
    return null;
  }

  return (
    <Alert variant="info" className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <BsBug className="me-2" />
          <strong>Debug Information Available</strong>
        </div>
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          aria-controls="debug-collapse"
          aria-expanded={showDebug}
        >
          {showDebug ? "Hide" : "Show"} Debug Info
        </Button>
      </div>

      <Collapse in={showDebug}>
        <div id="debug-collapse">
          <hr />
          <pre className="mb-0 p-3 bg-dark text-light rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </Collapse>
    </Alert>
  );
};

export default ArticleDebugInfo;
