import { Capacitor } from '@capacitor/core';

/**
 * Get the API base URL based on the environment
 * - In Capacitor (Android/iOS): Use the deployed backend URL
 * - In web browser: Use relative URLs (same origin)
 */
export function getApiBaseUrl(): string {
  // Check if running in Capacitor (native mobile app)
  if (Capacitor.isNativePlatform()) {
    // Use environment variable or fallback to empty string
    // This will be set during build time
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (!backendUrl) {
      console.error('VITE_API_BASE_URL is not configured for mobile app!');
      console.error('The app needs to connect to your deployed backend.');
      return '';
    }
    
    return backendUrl;
  }
  
  // For web, use relative URLs (same origin)
  return '';
}

/**
 * Build full API URL
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  
  // If path already starts with http, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}
