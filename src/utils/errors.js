/** Pull a human-readable message out of an axios error (or any thrown value). */
export const getApiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (!err) return fallback;

  // Backend ApiResponse envelope: { success, message, data } or { message, errors }
  const data = err.response?.data;
  if (data) {
    if (typeof data === 'string' && data.trim()) return data;
    if (data.message) return data.message;
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors.map((e) => e.defaultMessage || e.message || e).join(', ');
    }
  }

  // No response at all -> network / proxy / server-down
  if (err.request && !err.response) {
    return 'Cannot reach the server. Make sure the backend is running on port 8080.';
  }

  return err.message || fallback;
};
