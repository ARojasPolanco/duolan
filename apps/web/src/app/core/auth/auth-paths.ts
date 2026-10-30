export const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const;

export const PUBLIC_AUTH_ROUTES = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
] as const;

export const isAuthEndpoint = (url: string): boolean =>
  AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

export const isPublicAuthRoute = (url: string): boolean => {
  const path = url.split('?')[0];
  return PUBLIC_AUTH_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
};
