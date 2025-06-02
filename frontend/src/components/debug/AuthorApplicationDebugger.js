// frontend/src/components/debug/AuthorApplicationDebugger.js
import React, { useState, useContext } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import AuthContext from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { useCanApplyForAuthor, useMyAuthorApplication } from '../../hooks/queries/useAuthorApplications';

const AuthorApplicationDebugger = () => {
  const { user } = useContext(AuthContext);
  const [manualTestResult, setManualTestResult] = useState(null);
  const [manualTestLoading, setManualTestLoading] = useState(false);

  const {
    data: canApplyData,
    isLoading: isCheckingEligibility,
    error: canApplyError,
    refetch: refetchCanApply
  } = useCanApplyForAuthor();

  const {
    data: application,
    isLoading: isLoadingApplication,
    error: applicationError,
    refetch: refetchApplication
  } = useMyAuthorApplication();

  const runManualTest = async () => {
    setManualTestLoading(true);
    setManualTestResult(null);

    try {
      // Test direct API calls
      const canApplyResponse = await apiService.authorApplications.canApply();
      const myApplicationResponse = await apiService.authorApplications.getMyApplication();

      setManualTestResult({
        success: true,
        canApply: canApplyResponse,
        myApplication: myApplicationResponse
      });
    } catch (error) {
      setManualTestResult({
        success: false,
        error: error
      });
    } finally {
      setManualTestLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Card>
        <Card.Header>
          <h5>Author Application Debug Information</h5>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <h6>User Information:</h6>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>

          <div className="mb-3">
            <h6>React Query Hook States:</h6>
            <ul>
              <li>isCheckingEligibility: {String(isCheckingEligibility)}</li>
              <li>isLoadingApplication: {String(isLoadingApplication)}</li>
              <li>canApplyData: {JSON.stringify(canApplyData)}</li>
              <li>application: {JSON.stringify(application)}</li>
              <li>canApplyError: {JSON.stringify(canApplyError)}</li>
              <li>applicationError: {JSON.stringify(applicationError)}</li>
            </ul>
          </div>

          <div className="mb-3">
            <Button variant="outline-primary" onClick={refetchCanApply} className="me-2">
              Refetch Can Apply
            </Button>
            <Button variant="outline-primary" onClick={refetchApplication}>
              Refetch Application
            </Button>
          </div>

          <div className="mb-3">
            <Button 
              variant="warning" 
              onClick={runManualTest}
              disabled={manualTestLoading}
            >
              {manualTestLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Testing...
                </>
              ) : (
                'Run Manual API Test'
              )}
            </Button>
          </div>

          {manualTestResult && (
            <div className="mb-3">
              <h6>Manual Test Result:</h6>
              <Alert variant={manualTestResult.success ? 'success' : 'danger'}>
                <pre>{JSON.stringify(manualTestResult, null, 2)}</pre>
              </Alert>
            </div>
          )}

          <div className="mb-3">
            <h6>Authentication Token Info:</h6>
            <ul>
              <li>localStorage token: {localStorage.getItem('beekeeper_auth_token') ? 'Present' : 'Missing'}</li>
              <li>sessionStorage token: {sessionStorage.getItem('beekeeper_auth_token') ? 'Present' : 'Missing'}</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AuthorApplicationDebugger;