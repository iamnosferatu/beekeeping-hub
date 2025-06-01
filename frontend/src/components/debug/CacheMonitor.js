// frontend/src/components/debug/CacheMonitor.js

/**
 * Cache Monitoring and Debugging Component
 * 
 * Provides real-time insights into cache performance, request deduplication,
 * and prefetching effectiveness for development and debugging.
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Table, ProgressBar, Alert, Nav } from 'react-bootstrap';
import { BsGraphUp, BsDatabase, BsLightning, BsGear, BsTrash, BsDownload } from 'react-icons/bs';
import { cacheUtils, requestUtils } from '../../lib/queryClient';
import { smartRequest } from '../../lib/requestDeduplication';
import { warmCache } from '../../lib/cacheWarming';
import cacheInvalidationManager from '../../lib/cacheInvalidation';

const CacheMonitor = () => {
  const [stats, setStats] = useState({
    cache: {},
    deduplication: {},
    warming: {},
    invalidation: {},
  });
  const [cacheData, setCacheData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Refresh data
  const refreshStats = () => {
    const newStats = {
      cache: cacheUtils.getCacheStats(),
      deduplication: smartRequest.getStats(),
      warming: warmCache.getStats(),
      invalidation: cacheInvalidationManager.getStats(),
    };
    
    setStats(newStats);
    setCacheData(cacheUtils.exportCache());
  };

  // Auto-refresh toggle
  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      setAutoRefresh(false);
    } else {
      const interval = setInterval(refreshStats, 2000);
      setRefreshInterval(interval);
      setAutoRefresh(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    refreshStats();
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Clear cache actions
  const clearAllCache = () => {
    smartRequest.clear();
    warmCache.clear();
    cacheInvalidationManager.resetStats();
    refreshStats();
  };

  const resetStats = () => {
    smartRequest.resetStats();
    warmCache.resetStats();
    cacheInvalidationManager.resetStats();
    refreshStats();
  };

  // Export cache data
  const exportCacheData = () => {
    const data = {
      stats,
      cacheData,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cache-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate efficiency metrics
  const calculateEfficiency = () => {
    const { deduplication } = stats;
    const totalRequests = deduplication.totalRequests || 0;
    const deduplicatedRequests = deduplication.deduplicatedRequests || 0;
    const cacheHits = deduplication.cacheHits || 0;
    
    return {
      deduplicationRatio: totalRequests > 0 ? ((deduplicatedRequests / totalRequests) * 100).toFixed(1) : 0,
      cacheHitRatio: totalRequests > 0 ? ((cacheHits / totalRequests) * 100).toFixed(1) : 0,
      totalSaved: deduplicatedRequests + cacheHits,
    };
  };

  const efficiency = calculateEfficiency();

  const renderOverview = () => (
    <Row>
      <Col md={6} lg={3} className="mb-3">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center">
              <BsDatabase className="text-primary me-3" size={24} />
              <div>
                <h6 className="mb-0">Cache Queries</h6>
                <h4 className="mb-0">{stats.cache.totalQueries || 0}</h4>
                <small className="text-muted">
                  {stats.cache.freshQueries || 0} fresh, {stats.cache.staleQueries || 0} stale
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3} className="mb-3">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center">
              <BsLightning className="text-success me-3" size={24} />
              <div>
                <h6 className="mb-0">Deduplication</h6>
                <h4 className="mb-0">{efficiency.deduplicationRatio}%</h4>
                <small className="text-muted">
                  {stats.deduplication.deduplicatedRequests || 0} saved
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3} className="mb-3">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center">
              <BsGraphUp className="text-info me-3" size={24} />
              <div>
                <h6 className="mb-0">Cache Hits</h6>
                <h4 className="mb-0">{efficiency.cacheHitRatio}%</h4>
                <small className="text-muted">
                  {stats.deduplication.cacheHits || 0} hits
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} lg={3} className="mb-3">
        <Card>
          <Card.Body>
            <div className="d-flex align-items-center">
              <BsGear className="text-warning me-3" size={24} />
              <div>
                <h6 className="mb-0">Warmups</h6>
                <h4 className="mb-0">{stats.warming.successfulWarmups || 0}</h4>
                <small className="text-muted">
                  {stats.warming.totalWarmups || 0} total
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={6} className="mb-3">
        <Card>
          <Card.Header>
            <h6 className="mb-0">Cache Performance</h6>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Deduplication Efficiency</span>
                <span>{efficiency.deduplicationRatio}%</span>
              </div>
              <ProgressBar 
                now={parseFloat(efficiency.deduplicationRatio)} 
                variant="success" 
              />
            </div>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Cache Hit Rate</span>
                <span>{efficiency.cacheHitRatio}%</span>
              </div>
              <ProgressBar 
                now={parseFloat(efficiency.cacheHitRatio)} 
                variant="info" 
              />
            </div>

            <div className="mb-0">
              <div className="d-flex justify-content-between">
                <span>Cache Size</span>
                <span>{((stats.cache.cacheSize || 0) / 1024).toFixed(1)} KB</span>
              </div>
              <ProgressBar 
                now={Math.min(((stats.cache.cacheSize || 0) / 1024) / 100, 100)} 
                variant="warning" 
              />
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={6} className="mb-3">
        <Card>
          <Card.Header>
            <h6 className="mb-0">Request Statistics</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col sm={6}>
                <div className="text-center">
                  <h4 className="text-primary">{stats.deduplication.totalRequests || 0}</h4>
                  <small className="text-muted">Total Requests</small>
                </div>
              </Col>
              <Col sm={6}>
                <div className="text-center">
                  <h4 className="text-success">{efficiency.totalSaved}</h4>
                  <small className="text-muted">Requests Saved</small>
                </div>
              </Col>
            </Row>
            
            {stats.warming.averageWarmupTime > 0 && (
              <div className="mt-3 text-center">
                <small className="text-muted">
                  Avg. Warmup Time: {stats.warming.averageWarmupTime.toFixed(0)}ms
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderCacheDetails = () => (
    <Card>
      <Card.Header>
        <h6 className="mb-0">Cache Entries ({cacheData.length})</h6>
      </Card.Header>
      <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Table striped hover size="sm">
          <thead>
            <tr>
              <th>Query Key</th>
              <th>Status</th>
              <th>Stale Time</th>
              <th>Size</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {cacheData.map((entry, index) => (
              <tr key={index}>
                <td>
                  <code className="small">
                    {JSON.stringify(entry.queryKey).slice(0, 50)}
                    {JSON.stringify(entry.queryKey).length > 50 && '...'}
                  </code>
                </td>
                <td>
                  <Badge bg={entry.state === 'success' ? 'success' : 'danger'}>
                    {entry.state}
                  </Badge>
                </td>
                <td>
                  <small className="text-muted">
                    {entry.staleTime ? `${(entry.staleTime / 1000).toFixed(0)}s` : 'N/A'}
                  </small>
                </td>
                <td>
                  <small className="text-muted">
                    {(entry.dataSize / 1024).toFixed(1)} KB
                  </small>
                </td>
                <td>
                  <small className="text-muted">
                    {entry.dataUpdatedAt ? 
                      new Date(entry.dataUpdatedAt).toLocaleTimeString() : 
                      'N/A'
                    }
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  const renderInvalidationStats = () => (
    <Row>
      <Col lg={6}>
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Invalidation Statistics</h6>
          </Card.Header>
          <Card.Body>
            <Table size="sm">
              <tbody>
                <tr>
                  <td>Total Invalidations</td>
                  <td><Badge bg="primary">{stats.invalidation.totalInvalidations || 0}</Badge></td>
                </tr>
                <tr>
                  <td>Cascade Invalidations</td>
                  <td><Badge bg="warning">{stats.invalidation.cascadeInvalidations || 0}</Badge></td>
                </tr>
                <tr>
                  <td>Active Queries</td>
                  <td><Badge bg="info">{stats.invalidation.activeQueries || 0}</Badge></td>
                </tr>
                <tr>
                  <td>Invalidation Rules</td>
                  <td><Badge bg="secondary">{stats.invalidation.totalRules || 0}</Badge></td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={6}>
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Invalidations by Type</h6>
          </Card.Header>
          <Card.Body>
            {stats.invalidation.invalidationsByType && 
             Object.keys(stats.invalidation.invalidationsByType).length > 0 ? (
              <Table size="sm">
                <tbody>
                  {Object.entries(stats.invalidation.invalidationsByType).map(([type, count]) => (
                    <tr key={type}>
                      <td><code className="small">{type}</code></td>
                      <td><Badge bg="outline-primary">{count}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center text-muted">
                <small>No invalidations recorded yet</small>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div className="cache-monitor p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Cache Monitor</h4>
        <div>
          <Button
            variant={autoRefresh ? "success" : "outline-secondary"}
            onClick={toggleAutoRefresh}
            className="me-2"
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button variant="outline-primary" onClick={refreshStats} className="me-2">
            Refresh
          </Button>
          <Button variant="outline-info" onClick={exportCacheData} className="me-2">
            <BsDownload className="me-1" />
            Export
          </Button>
          <Button variant="outline-warning" onClick={resetStats} className="me-2">
            Reset Stats
          </Button>
          <Button variant="outline-danger" onClick={clearAllCache}>
            <BsTrash className="me-1" />
            Clear Cache
          </Button>
        </div>
      </div>

      {efficiency.totalSaved > 10 && (
        <Alert variant="success" className="mb-4">
          <strong>Great performance!</strong> The cache system has saved {efficiency.totalSaved} requests, 
          improving your app's efficiency by {((efficiency.totalSaved / (stats.deduplication.totalRequests || 1)) * 100).toFixed(1)}%.
        </Alert>
      )}

      <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Nav.Item>
          <Nav.Link eventKey="overview">Overview</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="cache">Cache Details</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="invalidation">Invalidation</Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'cache' && renderCacheDetails()}
      {activeTab === 'invalidation' && renderInvalidationStats()}
    </div>
  );
};

export default CacheMonitor;