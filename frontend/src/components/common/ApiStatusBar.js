// frontend/src/components/common/ApiStatusBar.js
import React, { useState, useEffect } from "react";
import { Alert, Button } from "react-bootstrap";
import { checkApiStatus } from "../../utils/apiUtils";
import { API_URL } from "../../config";

const ApiStatusBar = () => {
  // Start with assumed success to prevent flicker
  const [apiStatus, setApiStatus] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const isAvailable = await checkApiStatus();
      console.log("API status:", isAvailable ? "available" : "unavailable");
      setApiStatus(isAvailable);
      setHasChecked(true);
    } catch (error) {
      console.error("Error checking API status:", error);
      setApiStatus(false);
      setHasChecked(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check after a short delay to prevent flicker on fast connections
    const timeout = setTimeout(() => {
      checkStatus();
    }, 1000);

    // Check periodically
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything initially or when API is available
  if (!hasChecked || apiStatus === true) {
    return null;
  }

  // Only show when API is unavailable
  if (apiStatus === false) {
    return (
      <Alert variant="warning" className="mb-0 text-center py-2">
        <div className="d-flex justify-content-center align-items-center">
          <span>
            API server is currently unavailable. You're viewing demo
            content.&nbsp;
            {process.env.NODE_ENV === "development" && (
              <span className="d-none d-md-inline">
                Make sure the backend server is running at{" "}
                <code>{API_URL}</code>
              </span>
            )}
          </span>
          <Button
            size="sm"
            variant="outline-dark"
            className="ms-2"
            onClick={checkStatus}
            disabled={isChecking}
          >
            {isChecking ? "Checking..." : "Retry"}
          </Button>
        </div>
      </Alert>
    );
  }

  return null;
};

export default ApiStatusBar;
