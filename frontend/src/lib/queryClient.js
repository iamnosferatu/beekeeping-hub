// frontend/src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time before data is removed from cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: 2,
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Background refetching
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      // Error handling
      throwOnError: false,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      // Error handling
      throwOnError: false,
    },
  },
});

// Global error handler for React Query
queryClient.setMutationDefaults(['auth'], {
  mutationFn: async (variables) => {
    // This will be overridden by specific mutations
    throw new Error('Mutation function not implemented');
  },
  onError: (error) => {
    console.error('Auth mutation error:', error);
  },
});

// Set default error handler for all queries
queryClient.setQueryDefaults(['articles'], {
  staleTime: 2 * 60 * 1000, // Articles are stale after 2 minutes
});

queryClient.setQueryDefaults(['comments'], {
  staleTime: 1 * 60 * 1000, // Comments are stale after 1 minute
});

queryClient.setQueryDefaults(['user'], {
  staleTime: 10 * 60 * 1000, // User data is stale after 10 minutes
});

export default queryClient;