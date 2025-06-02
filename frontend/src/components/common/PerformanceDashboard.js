// frontend/src/components/common/PerformanceDashboard.js

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Badge, 
  Button, 
  Alert, 
  ProgressBar, 
  Table,
  Tabs,
  Tab,
  Accordion,
  Modal,
} from 'react-bootstrap';
import { 
  BsSpeedometer2, 
  BsMemory, 
  BsCloudArrowDown, 
  BsCpu, 
  BsGraphUp,
  BsExclamationTriangle,
  BsCheckCircle,
  BsInfoCircle,
  BsTrash,
  BsDownload,
} from 'react-icons/bs';
import { usePerformanceAnalytics } from '../../hooks/usePerformanceTracking';
import { useMemoryMonitor, MemoryOptimizer } from './MemoryMonitor';
import { getWebVitalsSummary, getCoreWebVitalsScore } from '../../utils/webVitalsMonitor';
import PerformanceMonitor from '../../utils/performanceMonitoring';

/**
 * Performance Analytics Dashboard
 * 
 * Comprehensive dashboard displaying:
 * - Web Vitals scores and metrics
 * - API performance statistics
 * - Component render performance
 * - Memory usage and trends
 * - Performance recommendations
 */
const PerformanceDashboard = ({ 
  showModal = false, 
  onClose = null,
  refreshInterval = 30000 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetails, setShowDetails] = useState(false);
  
  const { analytics, webVitals, refreshAnalytics } = usePerformanceAnalytics();
  const {
    memoryData,
    memoryHistory,
    memoryLeakDetected,
    memoryTrend,
    forceGarbageCollection,
    getMemoryUsagePercentage,
    getMemoryClassification,
    isSupported: memorySupported,
  } = useMemoryMonitor({ interval: refreshInterval });

  const [webVitalsData, setWebVitalsData] = useState(null);
  const [coreWebVitalsScore, setCoreWebVitalsScore] = useState(0);

  // Update Web Vitals data
  useEffect(() => {
    const updateWebVitals = () => {
      const vitals = getWebVitalsSummary();
      const score = getCoreWebVitalsScore();
      setWebVitalsData(vitals);
      setCoreWebVitalsScore(score);
    };

    updateWebVitals();
    const interval = setInterval(updateWebVitals, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Memoized calculations
  const performanceScore = useMemo(() => {
    if (!analytics || !webVitalsData) return 0;
    
    // Combine Web Vitals score with other metrics
    let score = coreWebVitalsScore * 0.4; // 40% from Web Vitals
    
    // API performance (30%)
    const apiStats = analytics.api || {};
    const apiScores = Object.values(apiStats).map(api => {
      if (api.average <= 200) return 100;
      if (api.average <= 500) return 80;
      if (api.average <= 1000) return 60;
      return 40;
    });
    const avgApiScore = apiScores.length > 0 ? 
      apiScores.reduce((sum, score) => sum + score, 0) / apiScores.length : 80;
    score += avgApiScore * 0.3;
    
    // Memory usage (20%)
    let memoryScore = 100;
    if (memoryData) {
      const classification = getMemoryClassification();
      switch (classification) {
        case 'low': memoryScore = 100; break;
        case 'normal': memoryScore = 80; break;
        case 'high': memoryScore = 60; break;
        case 'critical': memoryScore = 40; break;
        default: memoryScore = 70;
      }
    }
    score += memoryScore * 0.2;
    
    // Component performance (10%)
    const componentStats = analytics.components || {};
    const componentScores = Object.values(componentStats).map(comp => {
      if (comp.average <= 16) return 100;
      if (comp.average <= 33) return 80;
      if (comp.average <= 50) return 60;
      return 40;
    });
    const avgComponentScore = componentScores.length > 0 ?
      componentScores.reduce((sum, score) => sum + score, 0) / componentScores.length : 80;
    score += avgComponentScore * 0.1;
    
    return Math.round(score);
  }, [analytics, webVitalsData, coreWebVitalsScore, memoryData, getMemoryClassification]);

  // Get performance status
  const getPerformanceStatus = (score) => {
    if (score >= 90) return { status: 'Excellent', variant: 'success', icon: BsCheckCircle };
    if (score >= 75) return { status: 'Good', variant: 'info', icon: BsInfoCircle };
    if (score >= 60) return { status: 'Needs Improvement', variant: 'warning', icon: BsExclamationTriangle };
    return { status: 'Poor', variant: 'danger', icon: BsExclamationTriangle };
  };

  const performanceStatus = getPerformanceStatus(performanceScore);

  // Handle data export
  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      performanceScore,
      webVitals: webVitalsData,
      analytics,
      memory: {
        current: memoryData,
        history: memoryHistory.slice(-50), // Last 50 measurements
        leakDetected: memoryLeakDetected,
        trend: memoryTrend,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle clear data
  const handleClearData = () => {
    PerformanceMonitor.clear();
    refreshAnalytics();
  };

  // Render Web Vitals tab
  const renderWebVitalsTab = () => (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Core Web Vitals Score</h6>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className={`text-${getPerformanceStatus(coreWebVitalsScore).variant}`}>
                {coreWebVitalsScore}/100
              </h2>
              <ProgressBar 
                now={coreWebVitalsScore} 
                variant={getPerformanceStatus(coreWebVitalsScore).variant}
                className="mb-2"
              />
              <small className="text-muted">
                Based on LCP, FID, and CLS metrics
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Overall Performance Score</h6>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className={`text-${performanceStatus.variant}`}>
                {performanceScore}/100
              </h2>
              <ProgressBar 
                now={performanceScore} 
                variant={performanceStatus.variant}
                className="mb-2"
              />
              <Badge bg={performanceStatus.variant}>
                <performanceStatus.icon className="me-1" />
                {performanceStatus.status}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {webVitalsData && (
        <Row>
          {Object.entries(webVitalsData).map(([vital, data]) => (
            <Col md={4} key={vital} className="mb-3">
              <Card>
                <Card.Header>
                  <small className="text-muted">{vital}</small>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">{data.value?.toFixed(1)}</h5>
                      <small className="text-muted">
                        {vital === 'CLS' ? 'score' : 'ms'}
                      </small>
                    </div>
                    <Badge bg={
                      data.rating === 'good' ? 'success' :
                      data.rating === 'needs-improvement' ? 'warning' : 'danger'
                    }>
                      {data.rating?.replace('-', ' ')}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  // Render API Performance tab
  const renderApiTab = () => (
    <div>
      {analytics?.api && Object.keys(analytics.api).length > 0 ? (
        <Table responsive striped>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Requests</th>
              <th>Avg Response</th>
              <th>95th Percentile</th>
              <th>Error Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(analytics.api).map(([endpoint, data]) => (
              <tr key={endpoint}>
                <td>
                  <code className="small">{endpoint}</code>
                </td>
                <td>{data.count}</td>
                <td>{data.average?.toFixed(0)}ms</td>
                <td>{data.p95?.toFixed(0)}ms</td>
                <td>
                  {data.errorRate ? (
                    <Badge bg={data.errorRate > 5 ? 'danger' : data.errorRate > 1 ? 'warning' : 'success'}>
                      {data.errorRate.toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge bg="success">0%</Badge>
                  )}
                </td>
                <td>
                  <Badge bg={
                    data.average <= 200 ? 'success' :
                    data.average <= 500 ? 'info' :
                    data.average <= 1000 ? 'warning' : 'danger'
                  }>
                    {data.average <= 200 ? 'Fast' :
                     data.average <= 500 ? 'Good' :
                     data.average <= 1000 ? 'Slow' : 'Very Slow'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          <BsInfoCircle className="me-2" />
          No API performance data available yet. Start using the application to see metrics.
        </Alert>
      )}
    </div>
  );

  // Render Memory tab
  const renderMemoryTab = () => {
    if (!memorySupported) {
      return (
        <Alert variant="warning">
          <BsExclamationTriangle className="me-2" />
          Memory monitoring is not supported in this browser.
        </Alert>
      );
    }

    const healthStatus = MemoryOptimizer.getHealthStatus(memoryData);
    const suggestions = MemoryOptimizer.getSuggestions(memoryData, memoryHistory, memoryLeakDetected);

    return (
      <div>
        <Row className="mb-4">
          <Col md={6}>
            <Card className="h-100">
              <Card.Header>
                <h6 className="mb-0">Current Memory Usage</h6>
              </Card.Header>
              <Card.Body>
                {memoryData ? (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Used:</span>
                      <strong>{MemoryOptimizer.formatSize(memoryData.used)}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Total:</span>
                      <strong>{MemoryOptimizer.formatSize(memoryData.total)}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Limit:</span>
                      <strong>{MemoryOptimizer.formatSize(memoryData.limit)}</strong>
                    </div>
                    <ProgressBar 
                      now={getMemoryUsagePercentage()} 
                      variant={healthStatus.color}
                      className="mb-2"
                    />
                    <Badge bg={healthStatus.color} className="w-100">
                      {healthStatus.message}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center text-muted">
                    <BsMemory size={32} className="mb-2" />
                    <p>Loading memory data...</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Memory Status</h6>
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  onClick={forceGarbageCollection}
                  title="Force Garbage Collection"
                >
                  <BsTrash />
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Trend:</span>
                    <Badge bg={
                      memoryTrend === 'increasing' ? 'warning' :
                      memoryTrend === 'decreasing' ? 'success' : 'info'
                    }>
                      {memoryTrend}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Classification:</span>
                    <Badge bg={
                      getMemoryClassification() === 'critical' ? 'danger' :
                      getMemoryClassification() === 'high' ? 'warning' :
                      getMemoryClassification() === 'normal' ? 'info' : 'success'
                    }>
                      {getMemoryClassification()}
                    </Badge>
                  </div>
                  {memoryLeakDetected && (
                    <Alert variant="danger" className="mt-2">
                      <BsExclamationTriangle className="me-2" />
                      Potential memory leak detected!
                    </Alert>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {suggestions.length > 0 && (
          <Card>
            <Card.Header>
              <h6 className="mb-0">Memory Optimization Suggestions</h6>
            </Card.Header>
            <Card.Body>
              {suggestions.map((suggestion, index) => (
                <Alert key={index} variant={
                  suggestion.type === 'critical' ? 'danger' :
                  suggestion.type === 'warning' ? 'warning' : 'info'
                }>
                  <strong>{suggestion.message}</strong>
                  <ul className="mb-0 mt-2">
                    {suggestion.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </Alert>
              ))}
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

  // Render Components tab
  const renderComponentsTab = () => (
    <div>
      {analytics?.components && Object.keys(analytics.components).length > 0 ? (
        <Table responsive striped>
          <thead>
            <tr>
              <th>Component</th>
              <th>Renders</th>
              <th>Avg Time</th>
              <th>95th Percentile</th>
              <th>Slow Renders</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(analytics.components).map(([component, data]) => (
              <tr key={component}>
                <td>
                  <code className="small">{component}</code>
                </td>
                <td>{data.count}</td>
                <td>{data.average?.toFixed(1)}ms</td>
                <td>{data.p95?.toFixed(1)}ms</td>
                <td>
                  <Badge bg={data.slowCount > 0 ? 'warning' : 'success'}>
                    {data.slowCount || 0}
                  </Badge>
                </td>
                <td>
                  <Badge bg={
                    data.average <= 16 ? 'success' :
                    data.average <= 33 ? 'info' :
                    data.average <= 50 ? 'warning' : 'danger'
                  }>
                    {data.average <= 16 ? 'Fast' :
                     data.average <= 33 ? 'Good' :
                     data.average <= 50 ? 'Slow' : 'Very Slow'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          <BsInfoCircle className="me-2" />
          No component performance data available yet.
        </Alert>
      )}
    </div>
  );

  // Render Recommendations tab
  const renderRecommendationsTab = () => (
    <div>
      {analytics?.recommendations && analytics.recommendations.length > 0 ? (
        <Accordion>
          {analytics.recommendations.map((rec, index) => (
            <Accordion.Item key={index} eventKey={index.toString()}>
              <Accordion.Header>
                <Badge bg={
                  rec.severity === 'high' ? 'danger' :
                  rec.severity === 'medium' ? 'warning' : 'info'
                } className="me-2">
                  {rec.severity}
                </Badge>
                {rec.message}
              </Accordion.Header>
              <Accordion.Body>
                <p><strong>Suggestion:</strong> {rec.suggestion}</p>
                <Badge bg="secondary">{rec.type}</Badge>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Alert variant="success">
          <BsCheckCircle className="me-2" />
          No performance issues detected. Great job!
        </Alert>
      )}
    </div>
  );

  const dashboardContent = (
    <div className="performance-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">
            <BsSpeedometer2 className="me-2" />
            Performance Dashboard
          </h4>
          <small className="text-muted">
            Real-time application performance monitoring
          </small>
        </div>
        <div>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="me-2"
            onClick={refreshAnalytics}
          >
            <BsGraphUp className="me-1" />
            Refresh
          </Button>
          <Button 
            variant="outline-info" 
            size="sm" 
            className="me-2"
            onClick={handleExportData}
          >
            <BsDownload className="me-1" />
            Export
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={handleClearData}
          >
            <BsTrash className="me-1" />
            Clear
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="overview" title="Overview">
          {renderWebVitalsTab()}
        </Tab>
        <Tab eventKey="api" title="API Performance">
          {renderApiTab()}
        </Tab>
        <Tab eventKey="memory" title="Memory">
          {renderMemoryTab()}
        </Tab>
        <Tab eventKey="components" title="Components">
          {renderComponentsTab()}
        </Tab>
        <Tab eventKey="recommendations" title="Recommendations">
          {renderRecommendationsTab()}
        </Tab>
      </Tabs>
    </div>
  );

  if (showModal) {
    return (
      <Modal show={showModal} onHide={onClose} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Performance Dashboard</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {dashboardContent}
        </Modal.Body>
      </Modal>
    );
  }

  return dashboardContent;
};

export default PerformanceDashboard;