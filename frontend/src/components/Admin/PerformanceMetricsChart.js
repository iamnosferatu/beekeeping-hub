// frontend/src/components/admin/PerformanceMetricsChart.js
import React, { useState, useEffect } from 'react';
import { Card, Nav, Tab, Row, Col, Button, Badge } from 'react-bootstrap';
import { BsArrowRepeat, BsDownload, BsTrash } from 'react-icons/bs';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import PerformanceMonitor from '../../utils/performanceMonitoring';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceMetricsChart = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load performance data
  const loadPerformanceData = () => {
    setLoading(true);
    try {
      // Check localStorage first
      const storedData = localStorage.getItem('performance_metrics');
      console.log('Stored performance data:', storedData);
      
      const data = PerformanceMonitor.getAnalytics();
      console.log('Analytics data:', data);
      
      // Ensure we have valid data structure
      const validData = {
        summary: data.summary || { total: 0 },
        webVitals: data.webVitals || {},
        api: data.api || {},
        components: data.components || {},
        memory: data.memory || null,
        trends: data.trends || {},
        recommendations: data.recommendations || []
      };
      
      setAnalytics(validData);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      // Set default empty data structure
      setAnalytics({
        summary: { total: 0 },
        webVitals: {},
        api: {},
        components: {},
        memory: null,
        trends: {},
        recommendations: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all performance data?')) {
      PerformanceMonitor.clear();
      loadPerformanceData();
    }
  };

  const handleExportData = () => {
    const data = PerformanceMonitor.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading performance data...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Check if we have any data
  const hasData = analytics && (
    Object.keys(analytics.webVitals).length > 0 ||
    Object.keys(analytics.api).length > 0 ||
    Object.keys(analytics.components).length > 0
  );

  if (!hasData) {
    return (
      <Card className="mt-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Performance Metrics Visualization</h5>
            <div>
              <Button variant="outline-primary" size="sm" onClick={loadPerformanceData} className="me-2">
                <BsArrowRepeat className="me-1" /> Refresh
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleExportData} className="me-2">
                <BsDownload className="me-1" /> Export
              </Button>
              <Button variant="outline-danger" size="sm" onClick={handleClearData}>
                <BsTrash className="me-1" /> Clear
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-5">
            <h4 className="text-muted">No Performance Data Available</h4>
            <p className="text-muted">
              Performance metrics will appear here as you use the application.
            </p>
            <p className="text-muted">
              Navigate through different pages and interact with features to generate performance data.
            </p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Prepare chart data - handle empty data gracefully
  const hasWebVitals = Object.keys(analytics.webVitals).length > 0;
  const webVitalsData = {
    labels: hasWebVitals ? Object.keys(analytics.webVitals) : ['No Data'],
    datasets: [{
      label: 'Average (ms)',
      data: hasWebVitals ? Object.values(analytics.webVitals).map(v => v.average || 0) : [0],
      backgroundColor: hasWebVitals ? Object.values(analytics.webVitals).map(v => {
        if (v.classification === 'good') return 'rgba(40, 167, 69, 0.8)';
        if (v.classification === 'needs_improvement') return 'rgba(255, 193, 7, 0.8)';
        return 'rgba(220, 53, 69, 0.8)';
      }) : ['rgba(200, 200, 200, 0.8)'],
      borderColor: hasWebVitals ? Object.values(analytics.webVitals).map(v => {
        if (v.classification === 'good') return 'rgb(40, 167, 69)';
        if (v.classification === 'needs_improvement') return 'rgb(255, 193, 7)';
        return 'rgb(220, 53, 69)';
      }) : ['rgb(200, 200, 200)'],
      borderWidth: 1
    }]
  };

  // API Performance data
  const apiEndpoints = Object.keys(analytics.api).slice(0, 10); // Top 10 endpoints
  const apiPerformanceData = {
    labels: apiEndpoints.map(endpoint => {
      const parts = endpoint.split(' ');
      return `${parts[0]} ${parts[1].length > 30 ? parts[1].substring(0, 30) + '...' : parts[1]}`;
    }),
    datasets: [{
      label: 'Average Response Time (ms)',
      data: apiEndpoints.map(endpoint => analytics.api[endpoint].average),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    }]
  };

  // Memory usage over time
  const memoryTrendData = analytics.memory ? {
    labels: ['Current', 'Average', 'Peak'],
    datasets: [{
      label: 'Memory Usage (MB)',
      data: [
        analytics.memory.current / 1024 / 1024,
        analytics.memory.average / 1024 / 1024,
        analytics.memory.peak / 1024 / 1024
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 99, 132, 0.5)'
      ],
      borderColor: [
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(255, 99, 132)'
      ],
      borderWidth: 1
    }]
  } : null;

  // Performance trends
  const trendsData = {
    labels: Object.keys(analytics.trends),
    datasets: [
      {
        label: 'Total Metrics',
        data: Object.values(analytics.trends).map(t => t.total),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4
      },
      {
        label: 'API Calls',
        data: Object.values(analytics.trends).map(t => t.api),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4
      },
      {
        label: 'Errors',
        data: Object.values(analytics.trends).map(t => t.errors),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Component performance distribution
  const hasComponents = Object.keys(analytics.components).length > 0;
  const componentData = {
    labels: ['Fast (<16ms)', 'Slow (16-50ms)', 'Very Slow (>50ms)'],
    datasets: [{
      data: hasComponents ? Object.values(analytics.components).reduce((acc, comp) => {
        const fast = comp.count - comp.slowCount;
        const slow = comp.slowCount;
        const verySlow = comp.count > 0 ? Math.floor(comp.slowCount * 0.3) : 0; // Estimate
        return [acc[0] + fast, acc[1] + (slow - verySlow), acc[2] + verySlow];
      }, [0, 0, 0]) : [0, 0, 0],
      backgroundColor: [
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(220, 53, 69, 0.8)'
      ],
      borderColor: [
        'rgb(40, 167, 69)',
        'rgb(255, 193, 7)',
        'rgb(220, 53, 69)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <Card className="mt-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Performance Metrics Visualization</h5>
          <div>
            <Button variant="outline-primary" size="sm" onClick={loadPerformanceData} className="me-2">
              <BsArrowRepeat className="me-1" /> Refresh
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={handleExportData} className="me-2">
              <BsDownload className="me-1" /> Export
            </Button>
            <Button variant="outline-danger" size="sm" onClick={handleClearData}>
              <BsTrash className="me-1" /> Clear
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="overview">Overview</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="webvitals">Web Vitals</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="api">API Performance</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="components">Components</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="recommendations">Recommendations</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Overview Tab */}
            <Tab.Pane eventKey="overview">
              <Row className="g-4">
                <Col md={6}>
                  <Card>
                    <Card.Header>Performance Trends</Card.Header>
                    <Card.Body>
                      <Line 
                        data={trendsData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'top' },
                            title: { display: false }
                          },
                          scales: {
                            y: { beginAtZero: true }
                          }
                        }}
                      />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>Memory Usage</Card.Header>
                    <Card.Body>
                      {memoryTrendData ? (
                        <Bar 
                          data={memoryTrendData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              title: { display: false }
                            },
                            scales: {
                              y: { beginAtZero: true }
                            }
                          }}
                        />
                      ) : (
                        <div className="text-center text-muted py-5">
                          No memory data available
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* Web Vitals Tab */}
            <Tab.Pane eventKey="webvitals">
              <Row className="g-4">
                <Col md={8}>
                  <Card>
                    <Card.Header>Core Web Vitals</Card.Header>
                    <Card.Body>
                      <Bar 
                        data={webVitalsData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            title: { display: false }
                          },
                          scales: {
                            y: { beginAtZero: true }
                          }
                        }}
                      />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card>
                    <Card.Header>Web Vitals Summary</Card.Header>
                    <Card.Body>
                      {hasWebVitals ? (
                        Object.entries(analytics.webVitals).map(([vital, data]) => (
                          <div key={vital} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <strong>{vital}</strong>
                              <Badge bg={
                                data.classification === 'good' ? 'success' : 
                                data.classification === 'needs_improvement' ? 'warning' : 'danger'
                              }>
                                {data.classification}
                              </Badge>
                            </div>
                            <small className="text-muted">
                              Latest: {data.latest?.toFixed(2)}ms | 
                              Avg: {data.average?.toFixed(2)}ms
                            </small>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-4">
                          <p>No Web Vitals data collected yet.</p>
                          <small>Web Vitals data will appear as pages load.</small>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* API Performance Tab */}
            <Tab.Pane eventKey="api">
              <Card>
                <Card.Header>API Endpoint Performance</Card.Header>
                <Card.Body>
                  <Bar 
                    data={apiPerformanceData}
                    options={{
                      responsive: true,
                      indexAxis: 'y',
                      plugins: {
                        legend: { display: false },
                        title: { display: false }
                      },
                      scales: {
                        x: { beginAtZero: true }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Components Tab */}
            <Tab.Pane eventKey="components">
              <Row className="g-4">
                <Col md={6}>
                  <Card>
                    <Card.Header>Component Performance Distribution</Card.Header>
                    <Card.Body>
                      <Doughnut 
                        data={componentData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'bottom' }
                          }
                        }}
                      />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>Slowest Components</Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Component</th>
                              <th>Avg Time</th>
                              <th>Count</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hasComponents ? (
                              Object.entries(analytics.components)
                                .sort((a, b) => b[1].average - a[1].average)
                                .slice(0, 10)
                                .map(([name, data]) => (
                                  <tr key={name}>
                                    <td><code>{name}</code></td>
                                    <td>{data.average.toFixed(2)}ms</td>
                                    <td>{data.count}</td>
                                    <td>
                                      <Badge bg={
                                        data.classification === 'fast' ? 'success' : 
                                        data.classification === 'slow' ? 'warning' : 'danger'
                                      }>
                                        {data.classification}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center text-muted py-4">
                                  No component performance data yet
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* Recommendations Tab */}
            <Tab.Pane eventKey="recommendations">
              <Card>
                <Card.Header>Performance Recommendations</Card.Header>
                <Card.Body>
                  {analytics.recommendations.length > 0 ? (
                    <div className="list-group">
                      {analytics.recommendations.map((rec, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">
                              <Badge bg={
                                rec.severity === 'high' ? 'danger' : 
                                rec.severity === 'medium' ? 'warning' : 'info'
                              } className="me-2">
                                {rec.severity}
                              </Badge>
                              {rec.type.toUpperCase()}
                            </h6>
                          </div>
                          <p className="mb-1">{rec.message}</p>
                          <small className="text-muted">{rec.suggestion}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <p>No performance issues detected. Great job!</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

export default PerformanceMetricsChart;