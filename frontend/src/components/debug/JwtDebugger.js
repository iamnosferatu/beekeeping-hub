// frontend/src/components/debug/JwtDebugger.js
import React, { useContext, useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import AuthContext from "../../contexts/AuthContext";
import { TOKEN_NAME } from "../../config";

const JwtDebugger = () => {
  const { user, token, loading } = useContext(AuthContext);
  const [tokenData, setTokenData] = useState(null);
  const [tokenError, setTokenError] = useState(null);

  useEffect(() => {
    // Try to parse the JWT token
    if (token) {
      try {
        // Split the token and get the payload part
        const parts = token.split(".");
        if (parts.length !== 3) {
          setTokenError("Invalid JWT format");
          return;
        }

        // Decode the base64 payload
        const payload = JSON.parse(atob(parts[1]));
        setTokenData(payload);
      } catch (error) {
        setTokenError(`Failed to parse token: ${error.message}`);
      }
    } else {
      setTokenData(null);
    }
  }, [token]);

  // Check localStorage for token directly
  const localStorageToken = localStorage.getItem(TOKEN_NAME);

  return (
    <Card className="mt-4">
      <Card.Header className="bg-info text-white">
        <h5 className="mb-0">JWT Authentication Debugger</h5>
      </Card.Header>
      <Card.Body>
        <h6>Authentication Status</h6>
        <Table bordered striped>
          <tbody>
            <tr>
              <th>Loading State</th>
              <td>{loading ? "Loading..." : "Completed"}</td>
            </tr>
            <tr>
              <th>User Object</th>
              <td>
                {user ? (
                  <div>
                    <Badge bg="success" className="me-2">
                      Authenticated
                    </Badge>
                    <strong>Username:</strong> {user.username}
                    <br />
                    <strong>Role:</strong> <Badge bg="info">{user.role}</Badge>
                    <br />
                    <strong>Email:</strong> {user.email}
                  </div>
                ) : (
                  <Badge bg="danger">Not Authenticated</Badge>
                )}
              </td>
            </tr>
            <tr>
              <th>JWT in Context</th>
              <td>
                {token ? (
                  <div>
                    <Badge bg="success" className="me-2">
                      Present
                    </Badge>
                    <small className="text-muted">
                      {token.substring(0, 20)}...
                    </small>
                  </div>
                ) : (
                  <Badge bg="danger">Missing</Badge>
                )}
              </td>
            </tr>
            <tr>
              <th>JWT in localStorage</th>
              <td>
                {localStorageToken ? (
                  <div>
                    <Badge bg="success" className="me-2">
                      Present
                    </Badge>
                    <small className="text-muted">
                      {localStorageToken.substring(0, 20)}...
                    </small>
                  </div>
                ) : (
                  <Badge bg="danger">Missing</Badge>
                )}
              </td>
            </tr>
          </tbody>
        </Table>

        <h6>JWT Payload</h6>
        {tokenData ? (
          <div>
            <Table bordered>
              <tbody>
                {Object.entries(tokenData).map(([key, value]) => (
                  <tr key={key}>
                    <th>{key}</th>
                    <td>
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="mt-3">
              <strong>Expiration:</strong>{" "}
              {tokenData.exp
                ? new Date(tokenData.exp * 1000).toLocaleString()
                : "Not specified"}
              <br />
              <strong>Issued At:</strong>{" "}
              {tokenData.iat
                ? new Date(tokenData.iat * 1000).toLocaleString()
                : "Not specified"}
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            {tokenError || "No valid JWT token found"}
          </div>
        )}

        <div className="mt-3">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              localStorage.removeItem(TOKEN_NAME);
              window.location.reload();
            }}
          >
            Clear Token & Reload
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default JwtDebugger;
