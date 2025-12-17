export const getApiBaseUrl = () => {
  const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';
  // Remove trailing /panel if present to avoid double prefixing
  // since the API calls already include /panel prefix
  return rawBaseUrl.endsWith('/panel') ? rawBaseUrl.slice(0, -6) : rawBaseUrl;
};

export const API_BASE_URL = getApiBaseUrl();
