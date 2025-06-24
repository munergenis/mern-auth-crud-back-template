import { Router } from 'express';

const rootRoutes = Router();

rootRoutes.get('/', (req, res) => {
  const availableRoutes = [
    // Auth routes
    { method: 'GET', path: '/health' },
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
      path: '/*',
      note: 'Redirects to /.netlify/functions/api/:splat',
    },
  ];

  res.type('html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MERN Auth CRUD API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f4f4f4; }
          caption { font-size: 1.5rem; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <h1>MERN Auth CRUD API</h1>
        <table>
          <caption>Available Routes</caption>
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${availableRoutes
              .map(
                (route) => `
                  <tr>
                    <td>${route.method}</td>
                    <td>${route.path}</td>
                    <td>${route.note || ''}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
        <p style="margin-top:2rem;">
          <strong>Docs:</strong> <em>Add documentation URL here if available</em>
        </p>
      </body>
    </html>
  `);
});

export default rootRoutes;
