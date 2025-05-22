// frontend/src/components/debug/ApiDebugger.js - FIXED VERSION
import React, { useState, useEffect, useContext } from "react";
import { Card, Button, Alert, Badge, Tab, Nav } from "react-bootstrap";
import {
  BsCheckCircle,
  BsXCircle,
  BsInfoCircle,
  BsArrowRepeat,
  BsShieldLock,
} from "react-icons/bs";
import axios from "axios";
import { API_URL, BASE_URL, TOKEN_NAME } from "../../config";
import AuthContext from "../../contexts/AuthContext";
import TokenDebugger from "./TokenDebugger";

const ApiDebugger = () => {
  const { user, token } = useContext(AuthContext);
  const [apiStatus, setApiStatus] = useState({
    health: null,
    articles: null,
    auth: null,
    tags: null,
  });
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkEndpoint = async (url, name, requiresAuth = false) => {
    try {
      console.log(`Checking ${name} endpoint: ${url}`);

      const config = { timeout: 5000 };

      // Add auth header if required and token exists
      if (requiresAuth && token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
        console.log(`Adding auth header for ${name}`);
      }

      const response = await axios.get(url, config);
      console.log(`${name} response:`, response.data);

      return {
        status: "success",
        data: response.data,
        message: `${name} endpoint is working`,
        authenticated: requiresAuth,
      };
    } catch (error) {
      console.error(`${name} endpoint error:`, error);

      return {
        status: "error",
        message: error.message,
        authenticated: requiresAuth,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        },
      };
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setLastChecked(new Date());

    const results = {};

    // Check health endpoint
    results.health = await checkEndpoint(`${API_URL}/health`, "Health");

    // Check articles endpoint
    results.articles = await checkEndpoint(`${API_URL}/articles`, "Articles");

    // Check auth endpoint with token if available
    results.auth = await checkEndpoint(`${API_URL}/auth/me`, "Auth", true);

    // Check tags endpoint
    results.tags = await checkEndpoint(`${API_URL}/tags`, "Tags");

    setApiStatus(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status) => {
    switch (status?.status) {
      case "success":
        return <BsCheckCircle className="text-success" />;
      case "error":
        // Special handling for auth 401 when not logged in
        if (status.authenticated && status.details?.status === 401 && !user) {
          return <BsShieldLock className="text-warning" />;
        }
        return <BsXCircle className="text-danger" />;
      default:
        return <BsInfoCircle className="text-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.status) {
      case "success":
        return <Badge bg="success">Working</Badge>;
      case "error":
        // Special handling for auth 401
        if (status.authenticated && status.details?.status === 401) {
          if (!user) {
            return <Badge bg="warning">Not Logged In</Badge>;
          } else {
            return <Badge bg="danger">Auth Error</Badge>;
          }
        }
        return <Badge bg="danger">Error</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const hasRealErrors = () => {
    return Object.values(apiStatus).some(
      (status) =>
        status?.status === "error" &&
        !(status.authenticated && status.details?.status === 401 && !user)
    );
  };

  const hasAuthError = () => {
    return (
      apiStatus.auth?.status === "error" &&
      apiStatus.auth?.details?.status === 401 &&
      user
    ); // User is logged in but auth still fails
  };

  return (
    <Card className="api-debugger">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          API Status Checker
          {user && (
            <Badge bg="info" className="ms-2">
              Logged in as {user.role}
            </Badge>
          )}
        </h5>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={runDiagnostics}
          disabled={loading}
        >
          {loading ? (
            <>Checking...</>
          ) : (
            <>
              <BsArrowRepeat className="me-1" />
              Refresh
            </>
          )}
        </Button>
      </Card.Header>

      <Card.Body>
        {lastChecked && (
          <p className="text-muted small mb-3">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}

        <Tab.Container defaultActiveKey="overview">
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="overview">Overview</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="auth-info">Auth Info</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="details">Details</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="config">Config</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="overview">
              <div className="endpoint-status">
                {Object.entries(apiStatus).map(([endpoint, status]) => (
                  <div
                    key={endpoint}
                    className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                  >
                    <div className="d-flex align-items-center">
                      {getStatusIcon(status)}
                      <span className="ms-2 text-capitalize">{endpoint}</span>
                      {status?.authenticated && (
                        <BsShieldLock
                          className="ms-1 text-muted"
                          size={14}
                          title="Requires Authentication"
                        />
                      )}
                    </div>
                    <div>{getStatusBadge(status)}</div>
                  </div>
                ))}
              </div>

              {/* Summary Alerts */}
              {hasAuthError() && (
                <Alert variant="warning" className="mt-3">
                  <Alert.Heading>⚠️ Authentication Issue</Alert.Heading>
                  <p>
                    You're logged in as <strong>{user.username}</strong>, but
                    the auth endpoint is still returning 401.
                  </p>
                  <div className="mt-2">
                    <strong>Possible causes:</strong>
                    <ul className="mt-2">
                      <li>Token might be expired or invalid</li>
                      <li>Backend auth middleware might have issues</li>
                      <li>Token not being sent correctly with requests</li>
                    </ul>
                  </div>
                </Alert>
              )}

              {hasRealErrors() ? (
                <Alert variant="danger" className="mt-3">
                  <Alert.Heading>🚨 API Issues Detected</Alert.Heading>
                  <p>Some API endpoints are not responding correctly.</p>
                  <ul className="mb-0">
                    <li>
                      <strong>Check backend server</strong> is running on port
                      8080
                    </li>
                    <li>
                      <strong>Verify database connection</strong> and seeding
                    </li>
                    <li>
                      <strong>Check console logs</strong> for detailed error
                      messages
                    </li>
                  </ul>
                </Alert>
              ) : (
                <Alert variant="success" className="mt-3">
                  <Alert.Heading>✅ API is Working!</Alert.Heading>
                  <p>Your backend API is responding correctly.</p>
                  {!user && apiStatus.auth?.details?.status === 401 && (
                    <div className="mt-2">
                      <small className="text-muted">
                        ℹ️ Auth endpoint shows 401 because you're not logged in
                        - this is expected.
                      </small>
                    </div>
                  )}
                </Alert>
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="auth-info">
              <TokenDebugger />
            </Tab.Pane>

            <Tab.Pane eventKey="details">
              <div className="endpoint-details">
                {Object.entries(apiStatus).map(([endpoint, status]) => (
                  <Card key={endpoint} className="mb-3">
                    <Card.Header className="d-flex justify-content-between">
                      <span className="text-capitalize">
                        {endpoint} Endpoint
                      </span>
                      {getStatusBadge(status)}
                    </Card.Header>
                    <Card.Body>
                      {status?.status === "success" ? (
                        <div>
                          <p className="text-success">{status.message}</p>
                          {status.data && (
                            <details>
                              <summary>Response Data</summary>
                              <pre
                                className="mt-2 p-2 bg-dark rounded"
                                style={{ maxHeight: "200px", overflow: "auto" }}
                              >
                                {JSON.stringify(status.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ) : status?.status === "error" ? (
                        <div>
                          <p className="text-danger">Error: {status.message}</p>
                          {status.details?.status === 401 &&
                            endpoint === "auth" &&
                            user && (
                              <Alert variant="warning" className="mt-2">
                                <small>
                                  <strong>🔍 Auth Debug:</strong> You're logged
                                  in but getting 401. This suggests the token
                                  isn't being accepted by the backend.
                                </small>
                              </Alert>
                            )}
                          {status.details && (
                            <div className="mt-2">
                              <small>
                                <strong>Status:</strong> {status.details.status}{" "}
                                {status.details.statusText}
                              </small>
                              {status.details.data && (
                                <details className="mt-1">
                                  <summary>Error Details</summary>
                                  <pre className="mt-2 p-2 bg-dark rounded">
                                    {JSON.stringify(
                                      status.details.data,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted">No data available</p>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="config">
              <div className="config-info">
                <h6>Frontend Configuration</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td>
                        <strong>API URL:</strong>
                      </td>
                      <td>
                        <code>{API_URL}</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Base URL:</strong>
                      </td>
                      <td>
                        <code>{BASE_URL}</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Token Name:</strong>
                      </td>
                      <td>
                        <code>{TOKEN_NAME}</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Environment:</strong>
                      </td>
                      <td>
                        <code>{process.env.NODE_ENV}</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Current URL:</strong>
                      </td>
                      <td>
                        <code>{window.location.origin}</code>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h6 className="mt-4">Expected Backend Endpoints</h6>
                <ul className="list-unstyled">
                  <li>
                    ✅ <code>GET {API_URL}/health</code> - Health check
                  </li>
                  <li>
                    ✅ <code>GET {API_URL}/articles</code> - List articles
                  </li>
                  <li>
                    ✅ <code>GET {API_URL}/tags</code> - List tags
                  </li>
                  <li>
                    🔐 <code>GET {API_URL}/auth/me</code> - Current user
                    (requires valid auth token)
                  </li>
                </ul>

                <h6 className="mt-4">Troubleshooting</h6>
                <Alert variant="info">
                  <p>
                    <strong>If you see auth errors while logged in:</strong>
                  </p>
                  <ol>
                    <li>
                      Check if the JWT_SECRET matches between frontend and
                      backend
                    </li>
                    <li>
                      Verify the auth middleware is working in the backend
                    </li>
                    <li>Check browser Network tab for request headers</li>
                    <li>Try clearing localStorage and logging in again</li>
                    <li>Check backend console for auth-related errors</li>
                  </ol>
                </Alert>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

export default ApiDebugger;
