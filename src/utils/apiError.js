export function getApiErrorMessage(err, fallback = 'Request failed') {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ERR_NETWORK' || !err.response) {
    return 'Cannot reach the server. Make sure the backend is running (cd backend && npm start).';
  }
  return fallback;
}
