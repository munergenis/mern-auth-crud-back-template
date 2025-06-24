import { Router } from 'express';

const rootRoutes = Router();

rootRoutes.get('/', (req, res) => {
  res.json({
    message: 'MERN Auth CRUD API',
    availableRoutes: [
      // Auth routes
      { method: 'POST', path: '/auth/register' },
      { method: 'POST', path: '/auth/login' },
      { method: 'GET', path: '/auth/refresh' },
      { method: 'GET', path: '/auth/logout' },
      { method: 'GET', path: '/auth/email/verify/:code' },
      { method: 'POST', path: '/auth/password/forgot' },
      { method: 'POST', path: '/auth/password/reset' },
      // Dev-only routes
      { method: 'DELETE', path: '/auth/sessions' },
      { method: 'DELETE', path: '/auth/users' },
      { method: 'DELETE', path: '/auth/verification' },
      { method: 'DELETE', path: '/auth/destroy' },
      // User routes
      { method: 'GET', path: '/user/' },
      // Session routes
      { method: 'GET', path: '/sessions/' },
      { method: 'DELETE', path: '/sessions/:sessionId' },
      // Netlify redirect
      {
        method: 'ANY',
        path: '/api/*',
        note: 'Redirects to /.netlify/functions/api/:splat',
      },
    ],
    docs: 'Add documentation URL here if available',
  });
});

export default rootRoutes;
