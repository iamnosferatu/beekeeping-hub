// frontend/src/components/debug/ApiTestComponent.js
import React, { useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import apiService from "../../services/api";
import axios from "axios";
import { API_URL } from "../../config";

const ApiTestComponent = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testDirectAxios = async () => {
    try {
      setLoading(true);
      console.log("🧪 Testing direct axios call to:", `${API_URL}/articles`);

      const response = await axios.get(`${API_URL}/articles`);

      console.log("🧪 Direct axios response:", response);

      setResults((prev) => ({
        ...prev,
        directAxios: {
          success: true,
          status: response.status,
          data: response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          hasData: response.data && response.data.data,
          dataLength: response.data?.data?.length || 0,
        },
      }));
    } catch (error) {
      console.error("🧪 Direct axios error:", error);
      setResults((prev) => ({
        ...prev,
        directAxios: {
          success: false,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testApiService = async () => {
    try {
      setLoading(true);
      console.log("🧪 Testing apiService.articles.getAll()");

      const result = await apiService.articles.getAll();

      console.log("🧪 ApiService result:", result);

      setResults((prev) => ({
        ...prev,
        apiService: {
          success: result.success,
          data: result.data,
          error: result.error,
          dataType: typeof result.data,
          isArray: Array.isArray(result.data),
          hasNestedData: result.data && result.data.data,
          nestedDataLength: result.data?.data?.length || 0,
        },
      }));
    } catch (error) {
      console.error("🧪 ApiService error:", error);
      setResults((prev) => ({
        ...prev,
        apiService: {
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    await testDirectAxios();
    await testApiService();
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">🧪 API Test Component</h5>
      </Card.Header>
      <Card.Body>
        <p>
          This component tests the API calls directly to help debug the issue.
        </p>

        <div className="d-flex gap-2 mb-3">
          <Button variant="primary" onClick={runAllTests} disabled={loading}>
            {loading ? "Testing..." : "Run All Tests"}
          </Button>
          <Button
            variant="outline-primary"
            onClick={testDirectAxios}
            disabled={loading}
          >
            Test Direct Axios
          </Button>
          <Button
            variant="outline-secondary"
            onClick={testApiService}
            disabled={loading}
          >
            Test API Service
          </Button>
        </div>

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div>
            <h6>Test Results:</h6>

            {results.directAxios && (
              <Alert
                variant={results.directAxios.success ? "success" : "danger"}
              >
                <h6>Direct Axios Call</h6>
                <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(results.directAxios, null, 2)}
                </pre>
              </Alert>
            )}

            {results.apiService && (
              <Alert
                variant={results.apiService.success ? "success" : "danger"}
              >
                <h6>API Service Call</h6>
                <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(results.apiService, null, 2)}
                </pre>
              </Alert>
            )}
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            Check the browser console for detailed logs from each test.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ApiTestComponent;
