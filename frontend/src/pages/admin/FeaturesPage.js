// frontend/src/pages/admin/FeaturesPage.js
import React, { useState } from "react";
import { Container, Card, Table, Button, Badge, Modal, Form, Alert } from "react-bootstrap";
import { ToggleLeft, ToggleRight, Plus, Trash2, Clock } from "lucide-react";
import { useFeatures, useToggleFeature, useCreateFeature, useDeleteFeature } from "../../hooks/api/useSiteSettings";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import ErrorAlert from "../../components/common/ErrorAlert";
import BaseModal from "../../components/common/BaseModal";
import FormField from "../../components/common/FormField";
import { SEO } from "../../contexts/SEOContext";

/**
 * Features Management Page
 * 
 * Admin page for managing feature flags
 */
const FeaturesPage = () => {
  const { data: featuresData, loading, error, refetch } = useFeatures({ immediate: true });
  const { mutate: toggleFeature, loading: toggling } = useToggleFeature();
  const { mutate: createFeature, loading: creating } = useCreateFeature();
  const { mutate: deleteFeature, loading: deleting } = useDeleteFeature();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [newFeature, setNewFeature] = useState({ name: "", enabled: false });
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const features = featuresData?.data || [];

  /**
   * Handle feature toggle
   */
  const handleToggle = async (feature) => {
    setActionError(null);
    setSuccessMessage(null);
    
    toggleFeature(
      { featureName: feature.name, enabled: !feature.enabled },
      {
        onSuccess: () => {
          setSuccessMessage(`Feature '${feature.name}' ${!feature.enabled ? 'enabled' : 'disabled'} successfully`);
          refetch();
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (error) => {
          setActionError(error.message || "Failed to toggle feature");
        }
      }
    );
  };

  /**
   * Handle feature creation
   */
  const handleCreate = () => {
    setActionError(null);
    
    createFeature(newFeature, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewFeature({ name: "", enabled: false });
        setSuccessMessage(`Feature '${newFeature.name}' created successfully`);
        refetch();
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error) => {
        setActionError(error.message || "Failed to create feature");
      }
    });
  };

  /**
   * Handle feature deletion
   */
  const handleDelete = () => {
    if (!selectedFeature) return;
    
    setActionError(null);
    
    deleteFeature(selectedFeature.name, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setSuccessMessage(`Feature '${selectedFeature.name}' deleted successfully`);
        setSelectedFeature(null);
        refetch();
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (error) => {
        setActionError(error.message || "Failed to delete feature");
      }
    });
  };

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  /**
   * Check if feature is protected
   */
  const isProtectedFeature = (featureName) => {
    const protectedFeatures = ['forum'];
    return protectedFeatures.includes(featureName);
  };

  if (loading) {
    return <LoadingIndicator fullPage message="Loading features..." />;
  }

  if (error) {
    return (
      <Container className="py-4">
        <ErrorAlert 
          error={error} 
          onRetry={refetch}
        />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <SEO 
        title="Feature Management"
        description="Manage feature flags for the BeeKeeper's Hub application"
        noindex={true}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Feature Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          disabled={creating}
        >
          <Plus size={16} className="me-2" />
          Add Feature
        </Button>
      </div>

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {actionError && (
        <Alert variant="danger" dismissible onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Feature Name</th>
                <th>Status</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {features.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No features configured
                  </td>
                </tr>
              ) : (
                features.map((feature) => (
                  <tr key={feature.id}>
                    <td>
                      <strong>{feature.name}</strong>
                      {isProtectedFeature(feature.name) && (
                        <Badge bg="secondary" className="ms-2">Protected</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={feature.enabled ? "success" : "secondary"}>
                        {feature.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        <Clock size={14} className="me-1" />
                        {formatDate(feature.last_modified)}
                      </small>
                    </td>
                    <td>
                      <Button
                        variant={feature.enabled ? "outline-secondary" : "outline-success"}
                        size="sm"
                        onClick={() => handleToggle(feature)}
                        disabled={toggling}
                        className="me-2"
                      >
                        {feature.enabled ? (
                          <>
                            <ToggleRight size={16} className="me-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} className="me-1" />
                            Enable
                          </>
                        )}
                      </Button>
                      {!isProtectedFeature(feature.name) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedFeature(feature);
                            setShowDeleteModal(true);
                          }}
                          disabled={deleting}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Feature Modal */}
      <BaseModal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          setNewFeature({ name: "", enabled: false });
          setActionError(null);
        }}
        title="Create New Feature"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewFeature({ name: "", enabled: false });
                setActionError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating || !newFeature.name}
            >
              {creating ? "Creating..." : "Create Feature"}
            </Button>
          </>
        }
      >
        {actionError && (
          <Alert variant="danger" className="mb-3">
            {actionError}
          </Alert>
        )}
        
        <FormField
          label="Feature Name"
          name="name"
          value={newFeature.name}
          onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value.toLowerCase() })}
          placeholder="e.g., newsletter, comments"
          helpText="Feature name must be lowercase"
          required
        />
        
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            id="enabled-switch"
            label="Enable immediately"
            checked={newFeature.enabled}
            onChange={(e) => setNewFeature({ ...newFeature, enabled: e.target.checked })}
          />
        </Form.Group>
      </BaseModal>

      {/* Delete Confirmation Modal */}
      <BaseModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedFeature(null);
          setActionError(null);
        }}
        title="Delete Feature"
        size="sm"
        variant="danger"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedFeature(null);
                setActionError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Feature"}
            </Button>
          </>
        }
      >
        {actionError && (
          <Alert variant="danger" className="mb-3">
            {actionError}
          </Alert>
        )}
        
        <p>
          Are you sure you want to delete the feature <strong>{selectedFeature?.name}</strong>?
        </p>
        <p className="text-muted">
          This action cannot be undone.
        </p>
      </BaseModal>
    </Container>
  );
};

export default FeaturesPage;