// frontend/src/utils/articlesDebug.js

/**
 * Articles Loading Debug Utilities
 * 
 * Helps troubleshoot issues with articles not loading on initial page load
 */

import { queryClient } from '../lib/queryClient';
import { ARTICLES_QUERY_KEYS } from '../hooks/queries/useArticles';

/**
 * Debug articles cache state
 */
export const debugArticlesCache = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const cache = queryClient.getQueryCache();
  const articleQueries = cache.getAll().filter(query => 
    query.queryKey[0] === 'articles'
  );

  console.group('🔍 Articles Cache Debug');
  console.log('Total article queries in cache:', articleQueries.length);
  
  articleQueries.forEach((query, index) => {
    console.log(`Query ${index + 1}:`, {
      queryKey: query.queryKey,
      state: query.state.status,
      hasData: !!query.state.data,
      dataType: typeof query.state.data,
      isStale: query.isStale(),
      isFetching: query.state.fetchStatus === 'fetching',
      lastUpdated: new Date(query.state.dataUpdatedAt).toLocaleTimeString(),
      error: query.state.error?.message,
      dataStructure: query.state.data ? {
        isArray: Array.isArray(query.state.data),
        keys: typeof query.state.data === 'object' ? Object.keys(query.state.data) : 'not object',
        articlesArray: query.state.data?.articles ? `${query.state.data.articles.length} articles` : 'no articles property',
        directArray: Array.isArray(query.state.data) ? `${query.state.data.length} items` : 'not direct array'
      } : 'no data'
    });
  });
  
  console.groupEnd();
};

/**
 * Debug specific article list query
 */
export const debugArticleListQuery = (params = {}) => {
  if (process.env.NODE_ENV !== 'development') return;

  const queryKey = ARTICLES_QUERY_KEYS.list(params);
  const query = queryClient.getQueryCache().find({ queryKey });
  
  console.group('🔍 Article List Query Debug');
  console.log('Query Key:', queryKey);
  console.log('Query Found:', !!query);
  
  if (query) {
    console.log('Query Details:', {
      state: query.state.status,
      hasData: !!query.state.data,
      dataStructure: query.state.data,
      isStale: query.isStale(),
      isFetching: query.state.fetchStatus === 'fetching',
      lastUpdated: new Date(query.state.dataUpdatedAt).toLocaleTimeString(),
      error: query.state.error?.message
    });
  } else {
    console.log('❌ Query not found in cache');
    console.log('Available queries:', queryClient.getQueryCache().getAll().map(q => q.queryKey));
  }
  
  console.groupEnd();
};

/**
 * Force refresh articles cache
 */
export const forceRefreshArticles = async (params = {}) => {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('🔄 Force refreshing articles cache...');
  
  try {
    // Invalidate all article list queries
    await queryClient.invalidateQueries({ 
      queryKey: ARTICLES_QUERY_KEYS.lists() 
    });
    
    // Refetch the specific query
    const queryKey = ARTICLES_QUERY_KEYS.list(params);
    await queryClient.refetchQueries({ queryKey });
    
    console.log('✅ Articles cache refreshed');
    debugArticleListQuery(params);
  } catch (error) {
    console.error('❌ Error refreshing articles cache:', error);
  }
};

/**
 * Clear articles cache completely
 */
export const clearArticlesCache = () => {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('🗑️ Clearing articles cache...');
  
  queryClient.removeQueries({ 
    queryKey: ARTICLES_QUERY_KEYS.all 
  });
  
  console.log('✅ Articles cache cleared');
  debugArticlesCache();
};

/**
 * Monitor articles loading
 */
export const monitorArticlesLoading = () => {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('👀 Starting articles loading monitor...');
  
  // Monitor cache changes
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.query.queryKey[0] === 'articles') {
      console.log('📊 Articles cache event:', {
        type: event.type,
        queryKey: event.query.queryKey,
        state: event.query.state.status,
        hasData: !!event.query.state.data
      });
    }
  });
  
  // Return cleanup function
  return unsubscribe;
};

/**
 * Get articles loading diagnostics
 */
export const getArticlesDiagnostics = () => {
  const cache = queryClient.getQueryCache();
  const articleQueries = cache.getAll().filter(query => 
    query.queryKey[0] === 'articles'
  );
  
  const diagnostics = {
    totalQueries: articleQueries.length,
    queryStates: {},
    potentialIssues: [],
    recommendations: []
  };
  
  // Analyze query states
  articleQueries.forEach(query => {
    const state = query.state.status;
    diagnostics.queryStates[state] = (diagnostics.queryStates[state] || 0) + 1;
  });
  
  // Detect potential issues
  if (articleQueries.length === 0) {
    diagnostics.potentialIssues.push('No article queries in cache');
    diagnostics.recommendations.push('Check if useArticles hook is being called');
  }
  
  const errorQueries = articleQueries.filter(q => q.state.status === 'error');
  if (errorQueries.length > 0) {
    diagnostics.potentialIssues.push(`${errorQueries.length} queries in error state`);
    diagnostics.recommendations.push('Check network connectivity and API endpoints');
  }
  
  const loadingQueries = articleQueries.filter(q => q.state.status === 'pending');
  if (loadingQueries.length > 0) {
    diagnostics.potentialIssues.push(`${loadingQueries.length} queries stuck in loading state`);
    diagnostics.recommendations.push('Check for infinite loading loops or network timeouts');
  }
  
  const successQueries = articleQueries.filter(q => q.state.status === 'success');
  const emptyDataQueries = successQueries.filter(q => {
    const data = q.state.data;
    return !data || 
           (Array.isArray(data) && data.length === 0) ||
           (data.articles && Array.isArray(data.articles) && data.articles.length === 0);
  });
  
  if (emptyDataQueries.length > 0) {
    diagnostics.potentialIssues.push(`${emptyDataQueries.length} queries have empty data`);
    diagnostics.recommendations.push('Check API response format and data extraction logic');
  }
  
  return diagnostics;
};

// Make functions available globally in development - TEMPORARILY DISABLED
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   window.articlesDebug = {
//     debugCache: debugArticlesCache,
//     debugQuery: debugArticleListQuery,
//     forceRefresh: forceRefreshArticles,
//     clearCache: clearArticlesCache,
//     monitor: monitorArticlesLoading,
//     diagnostics: getArticlesDiagnostics
//   };
  
//   console.log('🛠️ Articles debug tools available at window.articlesDebug');
// }

export default {
  debugArticlesCache,
  debugArticleListQuery,
  forceRefreshArticles,
  clearArticlesCache,
  monitorArticlesLoading,
  getArticlesDiagnostics
};