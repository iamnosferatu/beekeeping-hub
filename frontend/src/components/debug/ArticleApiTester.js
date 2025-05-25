// frontend/src/components/debug/ArticleApiTester.js
import React, { useState } from "react";
import { Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config";

/**
 * ArticleApiTester Component
 *
 * A debug component to test article API endpoints directly
 * and visualize the response structure.
 */
const ArticleApiTester = () => {
  const [slug, setSlug] = useState("getting-started-with-beekeeping");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Test direct API call without any processing
   */
  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log(`🧪 Testing direct API call to: ${API_URL}/articles/${slug}`);

      // Make direct axios call
      const result = await axios.get(`${API_URL}/articles/${slug}`, {
        headers: {
          "Content-Type": "application/json",
          // Add auth header if needed
          ...(localStorage.getItem("beekeeper_auth_token") && {
            Authorization: `Bearer ${localStorage.getItem(
              "beekeeper_auth_token"
            )}`,
          }),
        },
      });

      console.log("🧪 Direct API Response:", result);

      // Store the complete response structure
      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data,
        // Analyze data structure
        analysis: {
          dataType: typeof result.data,
          isArray: Array.isArray(result.data),
          isObject: typeof result.data === "object",
          hasData: result.data && "data" in result.data,
          hasSuccess: result.data && "success" in result.data,
          dataKeys:
            result.data && typeof result.data === "object"
              ? Object.keys(result.data)
              : null,
          // Check for article properties
          articleCheck: {
            directId: result.data?.id,
            directTitle: result.data?.title,
            nestedId: result.data?.data?.id,
            nestedTitle: result.data?.data?.title,
          },
        },
      });
    } catch (err) {
      console.error("🧪 API Test Error:", err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test alternative endpoints
   */
  const testAlternativeEndpoints = async () => {
    const endpoints = [
      `/articles/${slug}`,
      `/articles/bySlug/${slug}`,
      `/articles?slug=${slug}`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${API_URL}${endpoint}`);
        const result = await axios.get(`${API_URL}${endpoint}`);

        console.log(`✅ Success with ${endpoint}:`, result.data);

        setResponse((prev) => ({
          ...prev,
          alternativeEndpoints: {
            ...prev?.alternativeEndpoints,
            [endpoint]: {
              success: true,
              data: result.data,
              hasArticle: !!(result.data?.id || result.data?.data?.id),
            },
          },
        }));
      } catch (err) {
        console.error(`❌ Failed with ${endpoint}:`, err.message);

        setResponse((prev) => ({
          ...prev,
          alternativeEndpoints: {
            ...prev?.alternativeEndpoints,
            [endpoint]: {
              success: false,
              error: err.message,
              status: err.response?.status,
            },
          },
        }));
      }
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">🧪 Article API Tester</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Article Slug</Form.Label>
          <Form.Control
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter article slug"
          />
        </Form.Group>

        <div className="d-flex gap-2 mb-3">
          <Button
            variant="primary"
            onClick={testDirectApi}
            disabled={loading || !slug}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Testing...
              </>
            ) : (
              "Test Direct API"
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={testAlternativeEndpoints}
            disabled={loading || !slug}
          >
            Test All Endpoints
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="danger">
            <Alert.Heading>API Error</Alert.Heading>
            <pre className="mb-0 small">{JSON.stringify(error, null, 2)}</pre>
          </Alert>
        )}

        {/* Response Display */}
        {response && (
          <div>
            <h6>Response Analysis:</h6>

            <Alert variant={response.status === 200 ? "success" : "warning"}>
              Status: {response.status} {response.statusText}
            </Alert>

            <Card className="mb-3">
              <Card.Header>Data Structure Analysis</Card.Header>
              <Card.Body>
                <pre className="mb-0 small">
                  {JSON.stringify(response.analysis, null, 2)}
                </pre>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Response Data</Card.Header>
              <Card.Body>
                <pre
                  className="mb-0 small"
                  style={{ maxHeight: "400px", overflow: "auto" }}
                >
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </Card.Body>
            </Card>

            {response.alternativeEndpoints && (
              <Card>
                <Card.Header>Alternative Endpoints</Card.Header>
                <Card.Body>
                  <pre className="mb-0 small">
                    {JSON.stringify(response.alternativeEndpoints, null, 2)}
                  </pre>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ArticleApiTester;
