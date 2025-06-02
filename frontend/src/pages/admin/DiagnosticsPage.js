// frontend/src/pages/admin/DiagnosticsPage.js
import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Tab,
  Nav,
  Alert,
  Spinner,
} from "react-bootstrap";
import { BsSend, BsArrowRepeat, BsClipboard, BsTrash } from "react-icons/bs";
import axios from "axios";
import { API_URL, BASE_URL } from "../../config";
import AuthContext from "../../contexts/AuthContext";

/**
 * DiagnosticsPage Component
 *
 * Admin tool for testing API endpoints and viewing system information
 * Uses full width of the admin content area
 */
const DiagnosticsPage = () => {
  const { user, token } = useContext(AuthContext);
  const [endpointUrl, setEndpointUrl] = useState("/api/health");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [requestHeaders, setRequestHeaders] = useState(
    '{\n  "Content-Type": "application/json"\n}'
  );
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    // Load history from localStorage on component mount
    const savedHistory = localStorage.getItem('apiRequestHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [systemInfo, setSystemInfo] = useState(null);
  const [loadingSystemInfo, setLoadingSystemInfo] = useState(false);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('apiRequestHistory', JSON.stringify(history));
  }, [history]);

  // Define fetchSystemInfo inside useEffect to avoid dependency issues
  useEffect(() => {
    const fetchSystemInfo = async () => {
      setLoadingSystemInfo(true);
      try {
        // This should be a protected admin-only endpoint
        const response = await axios.get(
          `${API_URL}/admin/diagnostics/system`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSystemInfo(response.data);
      } catch (error) {
        console.error("Error fetching system info:", error);
        setSystemInfo({
          error: "Failed to fetch system information",
          message: error.response?.data?.message || error.message,
        });
      } finally {
        setLoadingSystemInfo(false);
      }
    };

    fetchSystemInfo();
  }, [token]);

  // Create a separate function for the manual refresh button
  const refreshSystemInfo = async () => {
    setLoadingSystemInfo(true);
    try {
      const response = await axios.get(`${API_URL}/admin/diagnostics/system`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSystemInfo(response.data);
    } catch (error) {
      console.error("Error fetching system info:", error);
      setSystemInfo({
        error: "Failed to fetch system information",
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setLoadingSystemInfo(false);
    }
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);

    let options = {}; // Declare options in outer scope

    try {
      // Parse headers
      let headers = {};
      try {
        headers = JSON.parse(requestHeaders);
      } catch (e) {
        throw new Error(`Invalid JSON in headers: ${e.message}`);
      }

      // Add authorization header if not present
      if (!headers.Authorization && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Prepare request options
      options = {
        method,
        headers,
        url: endpointUrl.startsWith("http")
          ? endpointUrl
          : `${BASE_URL}${
              endpointUrl.startsWith("/") ? "" : "/"
            }${endpointUrl}`,
      };

      // Add request body for non-GET requests
      if (method !== "GET" && requestBody.trim()) {
        try {
          options.data = JSON.parse(requestBody);
        } catch (e) {
          throw new Error(`Invalid JSON in request body: ${e.message}`);
        }
      }

      // Start timer for performance measurement
      const startTime = performance.now();

      // Send request
      const response = await axios(options);

      // Calculate response time
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Format response
      const result = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        responseTime: `${responseTime.toFixed(2)}ms`,
      };

      setResponse(result);

      // Add to history
      setHistory((prev) => [
        {
          id: Date.now(),
          url: options.url,
          method,
          status: response.status,
          statusText: response.statusText,
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString(),
          responseTime: responseTime.toFixed(2),
        },
        ...prev.slice(0, 49), // Keep last 50 requests
      ]);
    } catch (error) {
      console.error("Request error:", error);

      setError({
        message: error.message,
        response: error.response?.data || "No response data",
        status: error.response?.status || "No status code",
      });

      // Add failed requests to history too
      const requestUrl = options.url || `${BASE_URL}${endpointUrl.startsWith("/") ? "" : "/"}${endpointUrl}`;
      setHistory((prev) => [
        {
          id: Date.now(),
          url: requestUrl,
          method,
          status: error.response?.status || 0,
          statusText: error.response?.statusText || 'Error',
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString(),
          responseTime: 'N/A',
          error: true,
        },
        ...prev.slice(0, 49), // Keep last 50 requests
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatJson = (json) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return json;
    }
  };

  const loadRequestFromHistory = (item) => {
    setEndpointUrl(item.url.replace(BASE_URL, ""));
    setMethod(item.method);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('apiRequestHistory');
  };

  // Ensure only admins can access this page
  if (user?.role !== "admin") {
    return (
      <Alert variant="danger">
        <Alert.Heading>Access Denied</Alert.Heading>
        <p>
          You don't have permission to access this page. This incident will be
          reported.
        </p>
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="mb-2">API Diagnostics</h1>
        <p className="text-muted">
          Use this tool to test API endpoints and diagnose issues. This page is
          only accessible to administrators.
        </p>
      </div>

      <Tab.Container id="diagnostics-tabs" defaultActiveKey="endpoint-tester">
        <Card className="shadow-sm">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="endpoint-tester">Endpoint Tester</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="system-info">System Information</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="request-history">Request History</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            <Tab.Content>
              {/* Endpoint Tester Tab */}
              <Tab.Pane eventKey="endpoint-tester">
                <Row className="g-4">
                  <Col xl={6}>
                    <h5 className="mb-3">Request</h5>

                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendRequest();
                      }}
                    >
                      <Form.Group className="mb-3">
                        <Form.Label>Endpoint URL</Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type="text"
                            value={endpointUrl}
                            onChange={(e) => setEndpointUrl(e.target.value)}
                            placeholder="e.g., /api/articles or http://localhost:8080/api/health"
                            required
                          />
                          <Form.Select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            style={{ maxWidth: "120px" }}
                          >
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                            <option>PATCH</option>
                          </Form.Select>
                        </div>
                      </Form.Group>

                      {method !== "GET" && (
                        <Form.Group className="mb-3">
                          <Form.Label>Request Body (JSON)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={5}
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            placeholder='{"key": "value"}'
                            className="font-monospace"
                          />
                        </Form.Group>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label>Headers (JSON)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={requestHeaders}
                          onChange={(e) => setRequestHeaders(e.target.value)}
                          className="font-monospace"
                        />
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              <BsSend className="me-2" />
                              Send Request
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Col>

                  <Col xl={6}>
                    <h5 className="mb-3">Response</h5>

                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" />
                        <p className="mt-3">Sending request...</p>
                      </div>
                    ) : error ? (
                      <Alert variant="danger">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{error.message}</p>
                        {error.status && (
                          <p>
                            <strong>Status:</strong> {error.status}
                          </p>
                        )}
                        {error.response && (
                          <div>
                            <p>
                              <strong>Response:</strong>
                            </p>
                            <pre className="bg-dark text-light p-3 rounded">
                              {formatJson(error.response)}
                            </pre>
                          </div>
                        )}
                      </Alert>
                    ) : response ? (
                      <div className="response-container">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <span
                              className={`badge bg-${
                                response.status < 400 ? "success" : "danger"
                              }`}
                            >
                              {response.status} {response.statusText}
                            </span>
                            <span className="ms-3 text-muted">
                              {response.responseTime}
                            </span>
                          </div>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(formatJson(response.data))
                            }
                          >
                            <BsClipboard className="me-1" /> Copy
                          </Button>
                        </div>

                        <Card className="mb-3">
                          <Card.Header>Headers</Card.Header>
                          <Card.Body className="p-0">
                            <pre
                              className="m-0 p-3 bg-dark"
                              style={{ maxHeight: "150px", overflow: "auto" }}
                            >
                              {formatJson(response.headers)}
                            </pre>
                          </Card.Body>
                        </Card>

                        <Card>
                          <Card.Header>Response Body</Card.Header>
                          <Card.Body className="p-0">
                            <pre
                              className="m-0 p-3 bg-dark"
                              style={{ maxHeight: "300px", overflow: "auto" }}
                            >
                              {formatJson(response.data)}
                            </pre>
                          </Card.Body>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">
                        <p>
                          No response yet. Send a request to see results here.
                        </p>
                      </div>
                    )}
                  </Col>
                </Row>
              </Tab.Pane>

              {/* System Information Tab */}
              <Tab.Pane eventKey="system-info">
                {loadingSystemInfo ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="mt-3">Loading system information...</p>
                  </div>
                ) : systemInfo?.error ? (
                  <Alert variant="warning">
                    <Alert.Heading>
                      Could not load system information
                    </Alert.Heading>
                    <p>{systemInfo.message}</p>
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={refreshSystemInfo}
                      >
                        <BsArrowRepeat className="me-1" /> Retry
                      </Button>
                    </div>
                  </Alert>
                ) : systemInfo ? (
                  <div>
                    <Row className="g-4 mb-4">
                      <Col xl={6}>
                        <Card className="h-100">
                          <Card.Header>Server Information</Card.Header>
                          <Card.Body>
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td>Environment</td>
                                  <td>
                                    <code>{systemInfo.environment}</code>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Node.js Version</td>
                                  <td>
                                    <code>{systemInfo.nodeVersion}</code>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Uptime</td>
                                  <td>
                                    {Math.floor(systemInfo.uptime / 60)} minutes{" "}
                                    {Math.floor(systemInfo.uptime % 60)} seconds
                                  </td>
                                </tr>
                                <tr>
                                  <td>Current Time</td>
                                  <td>
                                    {new Date(
                                      systemInfo.serverTime
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xl={6}>
                        <Card className="h-100">
                          <Card.Header>Resource Usage</Card.Header>
                          <Card.Body>
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td>Memory (RSS)</td>
                                  <td>
                                    {(
                                      systemInfo.memory.rss /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{" "}
                                    MB
                                  </td>
                                </tr>
                                <tr>
                                  <td>Heap Used</td>
                                  <td>
                                    {(
                                      systemInfo.memory.heapUsed /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{" "}
                                    MB
                                  </td>
                                </tr>
                                <tr>
                                  <td>Heap Total</td>
                                  <td>
                                    {(
                                      systemInfo.memory.heapTotal /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{" "}
                                    MB
                                  </td>
                                </tr>
                                <tr>
                                  <td>CPU Usage</td>
                                  <td>
                                    {systemInfo.cpuUsage
                                      ? `${(systemInfo.cpuUsage * 100).toFixed(
                                          2
                                        )}%`
                                      : "Not available"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row className="g-4">
                      <Col xl={6}>
                        <Card className="h-100">
                          <Card.Header>Database Connection</Card.Header>
                          <Card.Body>
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td>Status</td>
                                  <td>
                                    {systemInfo.database.connected ? (
                                      <span className="badge bg-success">
                                        Connected
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        Disconnected
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Host</td>
                                  <td>
                                    <code>{systemInfo.database.host}</code>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Database</td>
                                  <td>
                                    <code>{systemInfo.database.database}</code>
                                  </td>
                                </tr>
                                <tr>
                                  <td>User</td>
                                  <td>
                                    <code>{systemInfo.database.user}</code>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xl={6}>
                        <Card className="h-100">
                          <Card.Header>Environment Variables</Card.Header>
                          <Card.Body>
                            <pre
                              className="m-0 bg-dark p-3"
                              style={{ maxHeight: "200px", overflow: "auto" }}
                            >
                              {formatJson(systemInfo.env)}
                            </pre>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={refreshSystemInfo}
                      >
                        <BsArrowRepeat className="me-1" /> Refresh
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert variant="info">
                    <p>System information not available.</p>
                  </Alert>
                )}
              </Tab.Pane>

              {/* Request History Tab */}
              <Tab.Pane eventKey="request-history">
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <h5>Recent Requests</h5>
                    <p className="text-muted">
                      Showing {history.length} of last 50 requests from this session
                    </p>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={clearHistory}
                    disabled={!history.length}
                  >
                    <BsTrash className="me-1" /> Clear History
                  </Button>
                </div>

                {history.length === 0 ? (
                  <Alert variant="info">
                    <Alert.Heading>No Request History</Alert.Heading>
                    <p>
                      No requests have been made yet. Use the endpoint tester tab to
                      make API requests. Request history is stored locally and persists
                      across page refreshes.
                    </p>
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-sm">
                      <thead>
                        <tr>
                          <th style={{ width: "120px" }}>Time</th>
                          <th style={{ width: "80px" }}>Method</th>
                          <th>URL</th>
                          <th style={{ width: "100px" }}>Status</th>
                          <th style={{ width: "100px" }}>Response Time</th>
                          <th style={{ width: "80px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item.id} className={item.error ? "table-danger" : ""}>
                            <td>
                              <small>{item.time}</small>
                            </td>
                            <td>
                              <span
                                className={`badge bg-${
                                  item.method === "GET"
                                    ? "primary"
                                    : item.method === "POST"
                                    ? "success"
                                    : item.method === "PUT"
                                    ? "warning"
                                    : item.method === "DELETE"
                                    ? "danger"
                                    : "secondary"
                                }`}
                              >
                                {item.method}
                              </span>
                            </td>
                            <td>
                              <code
                                className="text-truncate d-inline-block"
                                style={{
                                  maxWidth: "400px",
                                }}
                                title={item.url}
                              >
                                {item.url}
                              </code>
                            </td>
                            <td>
                              <span
                                className={`badge bg-${
                                  item.error
                                    ? "danger"
                                    : item.status < 400
                                    ? "success"
                                    : "warning"
                                }`}
                              >
                                {item.status || "Error"} {item.statusText && `(${item.statusText})`}
                              </span>
                            </td>
                            <td>
                              <small>{item.responseTime}{item.responseTime !== 'N/A' ? 'ms' : ''}</small>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => loadRequestFromHistory(item)}
                                title="Load this request in the endpoint tester"
                              >
                                Load
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </>
  );
};

export default DiagnosticsPage;
