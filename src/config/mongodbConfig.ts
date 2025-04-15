/* eslint-disable no-undef */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbOptions = {
  maxPoolSize: 10,
};

const connectToDb = async (): Promise<void> => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env file!');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, dbOptions);
    console.log('MongoDB is connected successfully.');
  } catch (e) {
    console.error('MongoDB connection failed:', e);
    throw e;
  }
};

export default connectToDb;
