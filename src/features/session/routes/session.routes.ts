import { Router } from 'express';
import {
  getSessionHandler,
  deleteSessionHandler,
} from '../controller/session.controller';

const sessionRoutes = Router();

// prefix: /sessions
sessionRoutes.get('/', getSessionHandler);
sessionRoutes.delete('/:sessionId', deleteSessionHandler);

export default sessionRoutes;
