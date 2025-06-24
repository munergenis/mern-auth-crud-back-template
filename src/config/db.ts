import mongoose from 'mongoose';
import { MONGO_URI } from '../lib/constants/env';

const connectDB = async () => {
  console.log('Connecting to DB');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
  } catch (error) {
    console.error('Could not connect to database', error);
    process.exit(1);
  }
};

export default connectDB;
