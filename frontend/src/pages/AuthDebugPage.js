// frontend/src/pages/AuthDebugPage.js
import React, { useContext } from "react";
import { Container, Card, Alert, Table, Badge, Button } from "react-bootstrap";
import AuthContext from "../contexts/AuthContext";
import JwtDebugger from "../components/debug/JwtDebugger";
import { TOKEN_NAME } from "../config";

const AuthDebugPage = () => {
  const { user, token, loading, error, logout, hasRole } =
    useContext(AuthContext);

  // Function to test hasRole
  const testHasRole = (role) => {
    return hasRole(role);
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Authentication Debug</h1>

      {error && (
        <Alert variant="danger">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Authentication Status</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <Alert variant="info">Loading authentication data...</Alert>
          ) : (
            <>
              <Table bordered>
                <tbody>
                  <tr>
                    <th width="200">Status</th>
                    <td>
                      {user ? (
                        <Badge bg="success">Authenticated</Badge>
                      ) : (
                        <Badge bg="danger">Not Authenticated</Badge>
                      )}
                    </td>
                  </tr>

                  {user && (
                    <>
                      <tr>
                        <th>User ID</th>
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
                          <Badge bg="primary">{user.role}</Badge>
                        </td>
                      </tr>
                    </>
                  )}

                  <tr>
                    <th>Token</th>
                    <td>
                      {token ? (
                        <div
                          className="text-truncate"
                          style={{ maxWidth: "500px" }}
                        >
                          <small>{token}</small>
                        </div>
                      ) : (
                        <span className="text-danger">No token</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <div className="mt-4">
                <h6>Role Checks</h6>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Has Role?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>user</td>
                      <td>
                        {testHasRole("user") ? (
                          <Badge bg="success">Yes</Badge>
                        ) : (
                          <Badge bg="danger">No</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>author</td>
                      <td>
                        {testHasRole("author") ? (
                          <Badge bg="success">Yes</Badge>
                        ) : (
                          <Badge bg="danger">No</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>admin</td>
                      <td>
                        {testHasRole("admin") ? (
                          <Badge bg="success">Yes</Badge>
                        ) : (
                          <Badge bg="danger">No</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>['author', 'admin']</td>
                      <td>
                        {testHasRole(["author", "admin"]) ? (
                          <Badge bg="success">Yes</Badge>
                        ) : (
                          <Badge bg="danger">No</Badge>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="d-flex mt-4">
                <Button variant="danger" className="me-2" onClick={logout}>
                  Logout
                </Button>

                <Button
                  variant="warning"
                  onClick={() => {
                    localStorage.removeItem(TOKEN_NAME);
                    window.location.reload();
                  }}
                >
                  Clear Local Storage
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <JwtDebugger />
    </Container>
  );
};

export default AuthDebugPage;
