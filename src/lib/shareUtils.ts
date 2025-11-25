export const isShareFeatureEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check URL parameter
  const params = new URLSearchParams(window.location.search);
  if (params.get('share') === 'true') return true;

  // Check localStorage for testing
  try {
    return localStorage.getItem('enableShare') === 'true';
  } catch {
    return false;
  }
};
