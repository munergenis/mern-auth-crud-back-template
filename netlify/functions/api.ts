import { HandlerContext, HandlerEvent } from '@netlify/functions';
import ServerlessHttp from 'serverless-http';
import connectDB from '../../src/config/db';
import app from '../../src/app';

/**
 *  Netlify App initialization
 */
const dbConnection = connectDB();

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  await dbConnection;

  const serverlessHandler = ServerlessHttp(app);

  return serverlessHandler(event, context);
};
