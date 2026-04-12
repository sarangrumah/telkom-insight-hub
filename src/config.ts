export const getApiBaseUrl = () => {
  const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';
  // Remove trailing /v2/panel if present to avoid double prefixing
  // since the API calls already include /v2/panel prefix
  return rawBaseUrl.endsWith('/v2/panel') ? rawBaseUrl.slice(0, -9) : rawBaseUrl;
};

export const API_BASE_URL = getApiBaseUrl();
