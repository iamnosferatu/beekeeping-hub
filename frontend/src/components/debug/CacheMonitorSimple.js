// frontend/src/components/debug/CacheMonitorSimple.js

/**
 * Simplified Cache Monitor with Error Handling
 * 
 * A robust cache monitoring component that gracefully handles missing dependencies
 * and provides basic cache insights.
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Table, Alert } from 'react-bootstrap';
import { BsGraphUp, BsDatabase, BsLightning, BsArrowClockwise } from 'react-icons/bs';
import { useQueryClient } from '@tanstack/react-query';

const CacheMonitorSimple = () => {
  const [stats, setStats] = useState({
    totalQueries: 0,
    freshQueries: 0,
    staleQueries: 0,
    errorQueries: 0,
    fetchingQueries: 0,
    cacheSize: 0,
  });
  const [cacheData, setCacheData] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const queryClient = useQueryClient();

  // Safe function to get cache statistics
  const getBasicCacheStats = () => {
    try {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      const stats = {
        totalQueries: queries.length,
        freshQueries: queries.filter(q => {
          try {
            return q && typeof q.isStale === 'function' && !q.isStale();
          } catch (e) {
            return false;
          }
        }).length,
        staleQueries: queries.filter(q => {
          try {
            return q && typeof q.isStale === 'function' && q.isStale();
          } catch (e) {
            return false;
          }
        }).length,
        errorQueries: queries.filter(q => {
          try {
            return q && typeof q.isError === 'function' && q.isError();
          } catch (e) {
            return q && q.state && q.state.status === 'error';
          }
        }).length,
        fetchingQueries: queries.filter(q => {
          try {
            return q && typeof q.isFetching === 'function' && q.isFetching();
          } catch (e) {
            return q && q.state && q.state.status === 'loading';
          }
        }).length,
        cacheSize: queries.reduce((size, query) => {
          try {
            return size + JSON.stringify(query.state?.data || {}).length;
          } catch (e) {
            return size;
          }
        }, 0),
      };

      const cacheEntries = queries.slice(0, 20).map((query, index) => {
        try {
          return {
            id: index,
            queryKey: query.queryKey || [],
            state: query.state?.status || 'unknown',
            dataUpdatedAt: query.state?.dataUpdatedAt,
            isStale: (() => {
              try {
                return query && typeof query.isStale === 'function' ? query.isStale() : false;
              } catch (e) {
                return false;
              }
            })(),
            isFetching: (() => {
              try {
                return query && typeof query.isFetching === 'function' ? query.isFetching() : false;
              } catch (e) {
                return query?.state?.status === 'loading' || false;
              }
            })(),
            dataSize: (() => {
              try {
                return JSON.stringify(query.state?.data || {}).length;
              } catch (e) {
                return 0;
              }
            })(),
          };
        } catch (e) {
          return {
            id: index,
            queryKey: ['invalid-query'],
            state: 'error',
            dataUpdatedAt: null,
            isStale: false,
            isFetching: false,
            dataSize: 0,
          };
        }
      });

      return { stats, cacheEntries };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      throw error;
    }
  };

  // Refresh data
  const refreshStats = () => {
    try {
      setError(null);
      const { stats: newStats, cacheEntries } = getBasicCacheStats();
      setStats(newStats);
      setCacheData(cacheEntries);
      setLastUpdate(new Date());
    } catch (err) {
      setError(`Failed to load cache data: ${err.message}`);
    }
  };

  // Initial load and setup
  useEffect(() => {
    refreshStats();
  }, []);

  // Clear all cache
  const clearCache = () => {
    try {
      queryClient.clear();
      refreshStats();
    } catch (err) {
      setError(`Failed to clear cache: ${err.message}`);
    }
  };

  // Format file size
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format query key for display
  const formatQueryKey = (queryKey) => {
    try {
      const keyStr = JSON.stringify(queryKey);
      return keyStr.length > 50 ? keyStr.slice(0, 47) + '...' : keyStr;
    } catch (e) {
      return 'Invalid key';
    }
  };

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Cache Monitor Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={refreshStats}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="cache-monitor-simple p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Cache Monitor</h4>
          <small className="text-muted">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </small>
        </div>
        <div>
          <Button variant="outline-primary" onClick={refreshStats} className="me-2">
            <BsArrowClockwise className="me-1" />
            Refresh
          </Button>
          <Button variant="outline-danger" onClick={clearCache}>
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <BsDatabase className="text-primary me-3" size={24} />
                <div>
                  <h6 className="mb-0">Total Queries</h6>
                  <h4 className="mb-0">{stats.totalQueries}</h4>
                  <small className="text-muted">
                    {stats.freshQueries} fresh, {stats.staleQueries} stale
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
                  <h6 className="mb-0">Cache Efficiency</h6>
                  <h4 className="mb-0">
                    {stats.totalQueries > 0 
                      ? ((stats.freshQueries / stats.totalQueries) * 100).toFixed(1)
                      : 0}%
                  </h4>
                  <small className="text-muted">Fresh data ratio</small>
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
                  <h6 className="mb-0">Cache Size</h6>
                  <h4 className="mb-0">{formatBytes(stats.cacheSize)}</h4>
                  <small className="text-muted">Memory usage</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {stats.fetchingQueries > 0 ? (
                    <div className="spinner-border spinner-border-sm text-warning" role="status" />
                  ) : (
                    <div className="bg-success rounded-circle" style={{width: 24, height: 24}} />
                  )}
                </div>
                <div>
                  <h6 className="mb-0">Status</h6>
                  <h4 className="mb-0">{stats.fetchingQueries}</h4>
                  <small className="text-muted">
                    {stats.fetchingQueries > 0 ? 'Loading...' : 'Idle'}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Cache Status Overview</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={3} className="text-center">
                  <Badge bg="success" className="p-2">
                    {stats.freshQueries} Fresh
                  </Badge>
                </Col>
                <Col sm={3} className="text-center">
                  <Badge bg="warning" className="p-2">
                    {stats.staleQueries} Stale
                  </Badge>
                </Col>
                <Col sm={3} className="text-center">
                  <Badge bg="danger" className="p-2">
                    {stats.errorQueries} Errors
                  </Badge>
                </Col>
                <Col sm={3} className="text-center">
                  <Badge bg="info" className="p-2">
                    {stats.fetchingQueries} Loading
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cache Entries Table */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">Cache Entries (Top 20)</h6>
        </Card.Header>
        <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {cacheData.length === 0 ? (
            <div className="text-center text-muted p-4">
              <p>No cache entries found</p>
              <small>Try navigating around the app to generate cache data</small>
            </div>
          ) : (
            <Table striped hover size="sm">
              <thead>
                <tr>
                  <th>Query Key</th>
                  <th>Status</th>
                  <th>Size</th>
                  <th>State</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {cacheData.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <code className="small">
                        {formatQueryKey(entry.queryKey)}
                      </code>
                    </td>
                    <td>
                      <Badge bg={
                        entry.state === 'success' ? 'success' :
                        entry.state === 'error' ? 'danger' :
                        entry.state === 'loading' ? 'info' : 'secondary'
                      }>
                        {entry.state}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatBytes(entry.dataSize)}
                      </small>
                    </td>
                    <td>
                      <div>
                        {entry.isStale && <Badge bg="warning" className="me-1">Stale</Badge>}
                        {entry.isFetching && <Badge bg="info" className="me-1">Loading</Badge>}
                        {!entry.isStale && !entry.isFetching && <Badge bg="success" className="me-1">Fresh</Badge>}
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {entry.dataUpdatedAt ? 
                          new Date(entry.dataUpdatedAt).toLocaleTimeString() : 
                          'Never'
                        }
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Instructions */}
      <Alert variant="info" className="mt-4">
        <Alert.Heading>How to Use</Alert.Heading>
        <ul className="mb-0">
          <li><strong>Navigate around the app</strong> to see cache entries populate</li>
          <li><strong>Fresh queries</strong> return data immediately from cache</li>
          <li><strong>Stale queries</strong> will refetch in the background</li>
          <li><strong>Click Refresh</strong> to see real-time cache status</li>
          <li><strong>Clear Cache</strong> removes all cached data (for testing)</li>
        </ul>
      </Alert>
    </div>
  );
};

export default CacheMonitorSimple;