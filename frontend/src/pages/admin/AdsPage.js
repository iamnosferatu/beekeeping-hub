// frontend/src/pages/admin/AdsPage.js

import React from 'react';
import AdsManagement from '../../components/Admin/AdsManagement';

/**
 * Ads Admin Page
 * 
 * Dedicated page for managing advertisements and ad settings
 */
const AdsPage = () => {
  return (
    <div className="ads-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Advertisement Management</h1>
          <p className="text-muted mb-0">
            Manage site advertisements, feature flags, and view analytics
          </p>
        </div>
      </div>

      <AdsManagement />
    </div>
  );
};

export default AdsPage;