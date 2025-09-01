// Utility to get API URL from environment variables

export function getApiUrl(path?: string): string {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) throw new Error("API_URL is not set");
  if (!path) return base;
  // Ensure exactly one slash between base and path
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
} 