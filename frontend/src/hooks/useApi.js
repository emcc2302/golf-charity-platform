import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * useApi — wraps an async API call with loading/error state
 * Usage:
 *   const { run, loading, error } = useApi();
 *   const data = await run(() => apiCall(params));
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn, { silent = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
      setError(msg);
      if (!silent) toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error };
};

/**
 * usePagination — simple client-side pagination helper
 */
export const usePagination = (items = [], perPage = 10) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / perPage);
  const paginated = items.slice((page - 1) * perPage, page * perPage);

  return {
    page, setPage, totalPages, paginated,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    next: () => setPage(p => Math.min(p + 1, totalPages)),
    prev: () => setPage(p => Math.max(p - 1, 1)),
  };
};
