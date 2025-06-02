// frontend/src/components/debug/AdminDevtools.js

import React, { useContext } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AuthContext from '../../contexts/AuthContext';

/**
 * Admin-only wrapper for React Query Devtools
 * Only renders the devtools if the current user is an admin
 */
const AdminDevtools = () => {
  const authContext = useContext(AuthContext);
  
  // Guard against missing context
  if (!authContext) {
    return null;
  }
  
  const { user, loading } = authContext;
  
  // Don't render while auth is loading
  if (loading) {
    return null;
  }
  
  // Only show devtools for admin users
  if (user?.role !== 'admin') {
    return null;
  }
  
  return <ReactQueryDevtools initialIsOpen={false} />;
};

export default AdminDevtools;