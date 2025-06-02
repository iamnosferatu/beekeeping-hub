// frontend/src/components/Admin/AdsManagement.js

import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Badge, Table, Modal } from 'react-bootstrap';
import { BsToggleOn, BsToggleOff, BsEye, BsBarChart, BsPlus, BsTrash, BsPencil } from 'react-icons/bs';
import { adManager, AD_PLACEMENTS, AD_PROVIDERS, checkFeatureFlag } from '../../utils/adManager';

/**
 * Ads Management Component for Admin
 * 
 * Allows administrators to:
 * - Toggle ads feature on/off
 * - View ad analytics
 * - Manage ad placements
 * - Configure ad settings
 */
const AdsManagement = () => {
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  // Form state for new/edit ad
  const [adForm, setAdForm] = useState({
    id: '',
    placement: '',
    provider: '',
    enabled: true,
    priority: 1,
    content: {}
  });

  useEffect(() => {
    loadAdsData();
  }, []);

  const loadAdsData = async () => {
    try {
      setLoading(true);
      
      // Load feature flag status
      const enabled = checkFeatureFlag('adsEnabled', true);
      setAdsEnabled(enabled);
      
      // Initialize ad manager and get data
      await adManager.init();
      const allAds = adManager.getAllAds();
      const analyticsData = adManager.getAnalytics();
      
      setAds(allAds);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load ads data:', error);
      setSaveStatus({
        type: 'danger',
        message: 'Failed to load ads data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAds = () => {
    const newValue = !adsEnabled;
    setAdsEnabled(newValue);
    
    // Save to localStorage (in a real app, this would be saved to backend)
    const siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    siteSettings.adsEnabled = newValue;
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    
    setSaveStatus({
      type: 'success',
      message: `Advertisements ${newValue ? 'enabled' : 'disabled'} successfully!`
    });
    
    setTimeout(() => setSaveStatus(null), 5000);
  };

  const handleToggleAd = (adId) => {
    const success = adManager.updateAd(adId, { 
      enabled: !ads.find(ad => ad.id === adId)?.enabled 
    });
    
    if (success) {
      loadAdsData();
      setSaveStatus({
        type: 'success',
        message: 'Ad status updated successfully!'
      });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setAdForm(ad);
    setShowModal(true);
  };

  const handleDeleteAd = (adId) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      const success = adManager.removeAd(adId);
      if (success) {
        loadAdsData();
        setSaveStatus({
          type: 'success',
          message: 'Ad deleted successfully!'
        });
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }
  };

  const handleSaveAd = () => {
    try {
      if (editingAd) {
        // Update existing ad
        adManager.updateAd(adForm.id, adForm);
      } else {
        // Add new ad
        adManager.addAd(adForm);
      }
      
      setShowModal(false);
      setEditingAd(null);
      setAdForm({
        id: '',
        placement: '',
        provider: '',
        enabled: true,
        priority: 1,
        content: {}
      });
      
      loadAdsData();
      setSaveStatus({
        type: 'success',
        message: `Ad ${editingAd ? 'updated' : 'created'} successfully!`
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({
        type: 'danger',
        message: 'Failed to save ad'
      });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ads-management">
      <h3 className="mb-4">Advertisement Management</h3>

      {/* Save status alert */}
      {saveStatus && (
        <Alert 
          variant={saveStatus.type} 
          dismissible 
          onClose={() => setSaveStatus(null)}
        >
          {saveStatus.message}
        </Alert>
      )}

      <Row>
        {/* Feature Toggle Card */}
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Ads Feature</h5>
              <Badge bg={adsEnabled ? 'success' : 'secondary'}>
                {adsEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Display Advertisements</span>
                <Button
                  variant="link"
                  className="p-0"
                  onClick={handleToggleAds}
                  style={{ fontSize: '1.5rem' }}
                >
                  {adsEnabled ? (
                    <BsToggleOn className="text-success" />
                  ) : (
                    <BsToggleOff className="text-muted" />
                  )}
                </Button>
              </div>
              <small className="text-muted">
                Toggle to enable or disable all advertisements across the site.
              </small>
            </Card.Body>
          </Card>
        </Col>

        {/* Analytics Card */}
        <Col md={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <BsBarChart className="me-2" />
                Analytics Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className="text-primary">{analytics.impressions || 0}</h4>
                    <small className="text-muted">Impressions</small>
                  </div>
                </Col>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className="text-success">{analytics.clicks || 0}</h4>
                    <small className="text-muted">Clicks</small>
                  </div>
                </Col>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className="text-info">{(analytics.ctr || 0).toFixed(2)}%</h4>
                    <small className="text-muted">CTR</small>
                  </div>
                </Col>
                <Col sm={3}>
                  <div className="text-center">
                    <h4 className="text-warning">{analytics.totalAds || 0}</h4>
                    <small className="text-muted">Active Ads</small>
                  </div>
                </Col>
              </Row>
              {analytics.adBlockDetected && (
                <Alert variant="warning" className="mt-3 mb-0">
                  <small>Ad blocker detected - some analytics may be incomplete</small>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ads List */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Manage Advertisements</h5>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => {
              setEditingAd(null);
              setAdForm({
                id: '',
                placement: '',
                provider: '',
                enabled: true,
                priority: 1,
                content: {}
              });
              setShowModal(true);
            }}
          >
            <BsPlus className="me-1" />
            Add New Ad
          </Button>
        </Card.Header>
        <Card.Body>
          {ads.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No advertisements configured
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Placement</th>
                  <th>Provider</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <code>{ad.id}</code>
                    </td>
                    <td>
                      <Badge bg="info">{ad.placement}</Badge>
                    </td>
                    <td>{ad.provider}</td>
                    <td>{ad.priority}</td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleToggleAd(ad.id)}
                      >
                        {ad.enabled ? (
                          <BsToggleOn className="text-success" />
                        ) : (
                          <BsToggleOff className="text-muted" />
                        )}
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditAd(ad)}
                      >
                        <BsPencil />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Ad Edit/Create Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Placement</Form.Label>
                  <Form.Select
                    value={adForm.placement}
                    onChange={(e) => setAdForm({ ...adForm, placement: e.target.value })}
                  >
                    <option value="">Select placement...</option>
                    {Object.entries(AD_PLACEMENTS).map(([key, value]) => (
                      <option key={value} value={value}>
                        {key.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Provider</Form.Label>
                  <Form.Select
                    value={adForm.provider}
                    onChange={(e) => setAdForm({ ...adForm, provider: e.target.value })}
                  >
                    <option value="">Select provider...</option>
                    {Object.entries(AD_PROVIDERS).map(([key, value]) => (
                      <option key={value} value={value}>
                        {key.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    value={adForm.priority}
                    onChange={(e) => setAdForm({ ...adForm, priority: parseInt(e.target.value) })}
                  />
                  <Form.Text className="text-muted">
                    Lower numbers have higher priority
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="ad-enabled-switch"
                    label="Enabled"
                    checked={adForm.enabled}
                    onChange={(e) => setAdForm({ ...adForm, enabled: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveAd}
            disabled={!adForm.placement || !adForm.provider}
          >
            {editingAd ? 'Update' : 'Create'} Ad
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdsManagement;