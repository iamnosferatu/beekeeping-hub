// frontend/src/components/debug/TokenDebugger.js - FIXED VERSION
import React, { useContext, useState } from "react";
import { Card, Button, Alert, Badge } from "react-bootstrap";
import { BsClipboard, BsTrash, BsArrowRepeat } from "react-icons/bs";
import AuthContext from "../../contexts/AuthContext";
import { TOKEN_NAME } from "../../config";

const TokenDebugger = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [decodedToken, setDecodedToken] = useState(null);
  const [decodeError, setDecodeError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Decode JWT token manually (just the payload, not verification)
  const decodeToken = React.useCallback(() => {
    try {
      if (!token) {
        setDecodeError("No token found");
        return;
      }

      const parts = token.split(".");
      if (parts.length !== 3) {
        setDecodeError("Invalid JWT format");
        return;
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));
      setDecodedToken(payload);
      setDecodeError(null);
    } catch (error) {
      setDecodeError(`Failed to decode token: ${error.message}`);
      setDecodedToken(null);
    }
  }, [token]);

  // Copy token to clipboard
  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setSuccessMessage("Token copied to clipboard!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Clear all auth data and logout
  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_NAME);
    logout();
    window.location.reload();
  };

  // Test the token directly against backend
  const testTokenDirectly = async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log("Direct token test result:", {
        status: response.status,
        statusText: response.statusText,
        data: result,
      });

      if (response.ok) {
        setSuccessMessage("✅ Token works! Auth issue might be elsewhere.");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(
          `❌ Token failed: ${response.status} - ${
            result.message || "Unknown error"
          }`
        );
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error("Direct token test error:", error);
      setErrorMessage(`❌ Request failed: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  React.useEffect(() => {
    if (token) {
      decodeToken();
    }
  }, [token, decodeToken]); // Fixed: Added decodeToken to dependencies

  const isTokenExpired = () => {
    if (!decodedToken || !decodedToken.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decodedToken.exp < now;
  };

  const getTimeUntilExpiry = () => {
    if (!decodedToken || !decodedToken.exp) return null;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decodedToken.exp - now;
    if (timeLeft <= 0) return "Expired";

    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));

    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours`;
    return `${Math.floor(timeLeft / 60)} minutes`;
  };

  return (
    <Card>
      <Card.Header>
        <h6 className="mb-0">🔑 Token Debugger</h6>
      </Card.Header>
      <Card.Body>
        {/* Auth Status */}
        <div className="mb-3">
          <strong>Authentication Status:</strong>{" "}
          {user ? (
            <Badge bg="success">
              Logged in as {user.username} ({user.role})
            </Badge>
          ) : (
            <Badge bg="danger">Not logged in</Badge>
          )}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert variant="success" className="mb-3" dismissible onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="danger" className="mb-3" dismissible onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Token Status */}
        <table className="table table-sm table-bordered">
          <tbody>
            <tr>
              <td>
                <strong>Token in Context:</strong>
              </td>
              <td>{token ? "✅ Present" : "❌ Missing"}</td>
            </tr>
            <tr>
              <td>
                <strong>Token in localStorage:</strong>
              </td>
              <td>
                {localStorage.getItem(TOKEN_NAME) ? "✅ Present" : "❌ Missing"}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Tokens Match:</strong>
              </td>
              <td>
                {token && localStorage.getItem(TOKEN_NAME)
                  ? token === localStorage.getItem(TOKEN_NAME)
                    ? "✅ Yes"
                    : "❌ No - Mismatch!"
                  : "⚠️ Cannot compare"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Token Details */}
        {token && (
          <div className="mb-3">
            <h6>Token Details:</h6>
            <div className="bg-dark p-2 rounded mb-2">
              <small className="font-monospace text-break">{token}</small>
            </div>

            <div className="d-flex gap-2 mb-3">
              <Button size="sm" variant="outline-secondary" onClick={copyToken}>
                <BsClipboard className="me-1" />
                Copy Token
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={testTokenDirectly}
              >
                <BsArrowRepeat className="me-1" />
                Test Directly
              </Button>
            </div>
          </div>
        )}

        {/* Decoded Token */}
        {decodedToken && (
          <div className="mb-3">
            <h6>Decoded Payload:</h6>
            <table className="table table-sm table-bordered">
              <tbody>
                <tr>
                  <td>
                    <strong>User ID:</strong>
                  </td>
                  <td>{decodedToken.id}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Issued At:</strong>
                  </td>
                  <td>
                    {decodedToken.iat
                      ? new Date(decodedToken.iat * 1000).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Expires At:</strong>
                  </td>
                  <td>
                    {decodedToken.exp
                      ? new Date(decodedToken.exp * 1000).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Time Until Expiry:</strong>
                  </td>
                  <td>
                    {isTokenExpired() ? (
                      <Badge bg="danger">Expired</Badge>
                    ) : (
                      <Badge bg="success">{getTimeUntilExpiry()}</Badge>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {decodeError && (
          <Alert variant="danger">
            <strong>Token Decode Error:</strong> {decodeError}
          </Alert>
        )}

        {/* Token Expired Alert */}
        {decodedToken && isTokenExpired() && (
          <Alert variant="warning">
            <strong>⚠️ Token Expired!</strong> Your token has expired. This is
            why auth is failing.
          </Alert>
        )}

        {/* Actions */}
        <div className="mt-3">
          <h6>Actions:</h6>
          <div className="d-flex gap-2">
            <Button size="sm" variant="warning" onClick={clearAuthData}>
              <BsTrash className="me-1" />
              Clear Auth & Logout
            </Button>
          </div>
          <small className="text-muted">
            This will clear localStorage and force a fresh login
          </small>
        </div>

        {/* Debug Instructions */}
        <Alert variant="info" className="mt-3">
          <strong>🔍 Debug Steps:</strong>
          <ol className="mb-0 mt-2">
            <li>Check if token is expired above</li>
            <li>Click "Test Directly" to test token against backend</li>
            <li>
              If token is valid but auth fails, there's a middleware issue
            </li>
            <li>
              If token is expired/invalid, click "Clear Auth & Logout" and login
              again
            </li>
          </ol>
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default TokenDebugger;
