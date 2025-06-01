// frontend/src/pages/DebugPage.js
import React, { useState, useEffect, useContext } from "react";
import { Card, Tab, Nav, Table, Button, Badge } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";
import ThemeContext from "../contexts/ThemeContext";
import CacheMonitor from "../components/debug/CacheMonitor";

const DebugPage = () => {
  const { user, token } = useContext(AuthContext);
  const { themeConfig, currentTheme } = useContext(ThemeContext);

  const [backendInfo, setBackendInfo] = useState(null);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    const fetchBackendDebugInfo = async () => {
      try {
        setBackendLoading(true);
        const res = await axios.get(`${API_URL}/debug`);
        setBackendInfo(res.data);
      } catch (err) {
        console.error("Error fetching backend debug info:", err);
        setBackendError("Failed to load backend debug information.");
      } finally {
        setBackendLoading(false);
      }
    };

    fetchBackendDebugInfo();
  }, []);

  return (
    <div className="debug-page">
      <h1>Debug Information</h1>
      <p className="text-muted mb-4">
        This page displays technical information about the application to help
        with development and debugging.
      </p>

      <Tab.Container id="debug-tabs" defaultActiveKey="frontend">
        <Card>
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="frontend">Frontend</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="backend">Backend</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="auth">Authentication</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="theme">Theme</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="cache">Cache Monitor</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            <Tab.Content>
              {/* Frontend Debug Info */}
              <Tab.Pane eventKey="frontend">
                <h4>Frontend Configuration</h4>

                <Table striped bordered responsive>
                  <tbody>
                    <tr>
                      <th>React Version</th>
                      <td>{React.version}</td>
                    </tr>
                    <tr>
                      <th>Environment</th>
                      <td>{process.env.NODE_ENV}</td>
                    </tr>
                    <tr>
                      <th>API URL</th>
                      <td>{API_URL}</td>
                    </tr>
                    <tr>
                      <th>Build Date</th>
                      <td>
                        {process.env.REACT_APP_BUILD_DATE || "Development"}
                      </td>
                    </tr>
                    <tr>
                      <th>User Agent</th>
                      <td>{navigator.userAgent}</td>
                    </tr>
                    <tr>
                      <th>Screen Size</th>
                      <td>{`${window.innerWidth}x${window.innerHeight}`}</td>
                    </tr>
                    <tr>
                      <th>Local Storage</th>
                      <td>
                        {Object.keys(localStorage).map((key) => (
                          <div key={key}>
                            <strong>{key}: </strong>
                            {key === "token"
                              ? `${localStorage
                                  .getItem(key)
                                  .substring(0, 15)}...`
                              : localStorage.getItem(key)}
                          </div>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <h4>Components</h4>
                <ul className="list-group mb-3">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    ArticleList
                    <Badge bg="success">Loaded</Badge>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    ThemeProvider
                    <Badge bg="success">Loaded</Badge>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    AuthProvider
                    <Badge bg="success">Loaded</Badge>
                  </li>
                </ul>

                <Button
                  variant="outline-danger"
                  onClick={() =>
                    console.log(
                      "Component tree:",
                      document.getElementById("root")
                    )
                  }
                >
                  Log Component Tree to Console
                </Button>
              </Tab.Pane>

              {/* Backend Debug Info */}
              <Tab.Pane eventKey="backend">
                <h4>Backend Status</h4>

                {backendLoading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : backendError ? (
                  <div className="alert alert-danger">{backendError}</div>
                ) : (
                  <div>
                    <Table striped bordered responsive>
                      <tbody>
                        <tr>
                          <th>Environment</th>
                          <td>{backendInfo.environment}</td>
                        </tr>
                        <tr>
                          <th>Server Time</th>
                          <td>{backendInfo.server.time}</td>
                        </tr>
                        <tr>
                          <th>Uptime</th>
                          <td>
                            {Math.floor(backendInfo.server.uptime / 60)} minutes
                          </td>
                        </tr>
                        <tr>
                          <th>Memory Usage</th>
                          <td>
                            {(
                              backendInfo.server.memoryUsage.heapUsed /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB /
                            {(
                              backendInfo.server.memoryUsage.heapTotal /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </td>
                        </tr>
                      </tbody>
                    </Table>

                    <h5>Database</h5>
                    <Table striped bordered responsive>
                      <tbody>
                        <tr>
                          <th>Host</th>
                          <td>{backendInfo.database.host}</td>
                        </tr>
                        <tr>
                          <th>Database</th>
                          <td>{backendInfo.database.database}</td>
                        </tr>
                        <tr>
                          <th>Connection Status</th>
                          <td>
                            {backendInfo.database.connected ? (
                              <Badge bg="success">Connected</Badge>
                            ) : (
                              <Badge bg="danger">Disconnected</Badge>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </Table>

                    <h5>Request Headers</h5>
                    <div
                      className="bg-dark p-3 mb-3"
                      style={{ maxHeight: "200px", overflow: "auto" }}
                    >
                      <pre className="mb-0">
                        {JSON.stringify(backendInfo.headers, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={() => window.open(`${API_URL}/debug-ui`, "_blank")}
                >
                  Open Backend Debug UI
                </Button>
              </Tab.Pane>

              {/* Auth Debug Info */}
              <Tab.Pane eventKey="auth">
                <h4>Authentication Information</h4>

                <div className="mb-3">
                  <strong>Authentication Status: </strong>
                  {user ? (
                    <Badge bg="success">Authenticated</Badge>
                  ) : (
                    <Badge bg="danger">Not Authenticated</Badge>
                  )}
                </div>

                {user && (
                  <>
                    <h5>User Details</h5>
                    <Table striped bordered responsive>
                      <tbody>
                        <tr>
                          <th>ID</th>
                          <td>{user.id}</td>
                        </tr>
                        <tr>
                          <th>Username</th>
                          <td>{user.username}</td>
                        </tr>
                        <tr>
                          <th>Email</th>
                          <td>{user.email}</td>
                        </tr>
                        <tr>
                          <th>Role</th>
                          <td>
                            <Badge
                              bg={
                                user.role === "admin"
                                  ? "danger"
                                  : user.role === "author"
                                  ? "warning"
                                  : "info"
                              }
                            >
                              {user.role}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <th>Last Login</th>
                          <td>{new Date(user.last_login).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </>
                )}

                <h5>JWT Token</h5>
                {token ? (
                  <div
                    className="bg-dark p-3 mb-3"
                    style={{ maxHeight: "200px", overflow: "auto" }}
                  >
                    <pre className="mb-0">{token}</pre>
                  </div>
                ) : (
                  <div className="alert alert-warning">No token found</div>
                )}
              </Tab.Pane>

              {/* Theme Debug Info */}
              <Tab.Pane eventKey="theme">
                <h4>Theme Configuration</h4>

                <div className="mb-3">
                  <strong>Current Theme: </strong>
                  <Badge bg="primary">{currentTheme}</Badge>
                </div>

                <h5>Theme Properties</h5>
                <Table striped bordered responsive>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Value</th>
                      <th>Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Primary Color</td>
                      <td>{themeConfig.primaryColor}</td>
                      <td>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: themeConfig.primaryColor,
                            borderRadius: "4px",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Secondary Color</td>
                      <td>{themeConfig.secondaryColor}</td>
                      <td>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: themeConfig.secondaryColor,
                            borderRadius: "4px",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Background Color</td>
                      <td>{themeConfig.bgColor}</td>
                      <td>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: themeConfig.bgColor,
                            borderRadius: "4px",
                            border: "1px solid #dee2e6",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Text Color</td>
                      <td>{themeConfig.textColor}</td>
                      <td>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: themeConfig.textColor,
                            borderRadius: "4px",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Link Color</td>
                      <td>{themeConfig.linkColor}</td>
                      <td>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: themeConfig.linkColor,
                            borderRadius: "4px",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Font Family</td>
                      <td>{themeConfig.fontFamily}</td>
                      <td>
                        <span style={{ fontFamily: themeConfig.fontFamily }}>
                          Aa Bb Cc
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Border Radius</td>
                      <td>{themeConfig.borderRadius}</td>
                      <td>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: themeConfig.primaryColor,
                            borderRadius: themeConfig.borderRadius,
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <h5>CSS Variables</h5>
                <div
                  className="bg-dark p-3 mb-3"
                  style={{ maxHeight: "200px", overflow: "auto" }}
                >
                  <pre className="mb-0">
                    {`:root {
  --primary-color: ${themeConfig.primaryColor};
  --secondary-color: ${themeConfig.secondaryColor};
  --bg-color: ${themeConfig.bgColor};
  --text-color: ${themeConfig.textColor};
  --link-color: ${themeConfig.linkColor};
  --font-family: ${themeConfig.fontFamily};
  --border-radius: ${themeConfig.borderRadius};
  --box-shadow: ${themeConfig.boxShadow};
  --navbar-bg: ${themeConfig.navbarBg};
  --navbar-text: ${themeConfig.navbarText};
  --footer-bg: ${themeConfig.footerBg};
  --footer-text: ${themeConfig.footerText};
}`}
                  </pre>
                </div>
              </Tab.Pane>

              {/* Cache Monitor Tab */}
              <Tab.Pane eventKey="cache">
                <CacheMonitor />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};

export default DebugPage;
