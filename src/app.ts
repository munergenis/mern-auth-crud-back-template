import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import authRoutes from './features/auth/routes/auth.routes';
import sessionRoutes from './features/session/routes/session.routes';
import userRoutes from './features/user/routes/user.routes';
import { APP_ORIGIN } from './lib/constants/env';
import authenticate from './middleware/authenticate';
import errorHandler from './middleware/errorHandler';
import { OK } from './lib/constants/http';
import rootRoutes from './root.routes';

const app = express();

// Express middleware config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: APP_ORIGIN,
  })
);
app.use(cookieParser());

/**
 * App Routes
 */

// Health Route
app.get('/health', (req, res) => {
  res.status(OK).json({ status: 'healthy' });
  return;
});
// Auth Routes
app.use('/auth', authRoutes);
// Protected Routes
app.use('/user', authenticate, userRoutes);
app.use('/sessions', authenticate, sessionRoutes);
app.use('/', rootRoutes);

// App Error Handler
app.use(errorHandler);

export default app;
