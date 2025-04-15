/* eslint-disable no-undef */
import dotenv from 'dotenv';
import app from './app';
import connectToDb from './src/config/mongodbConfig';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectToDb();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
