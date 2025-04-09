/* eslint-disable no-undef */
import express, { Request, Response } from 'express';
import connectToDb from './src/config/mongodbConfig';
import imageRoutes from './src/routes/requestRoute';
import './src/queue/collageWorker';
import cron from 'node-cron';
import { deleteOldFiles } from './src/objectStorage/deleteOldFiles';

const app = express();

app.use(express.json());
app.use('/api', imageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Collage Generator API is running 🚀');
});

connectToDb();
cron.schedule('0 0 * * *', async () => {
  console.log('Running task to delete old files...');
  await deleteOldFiles();
  process.exit(0);
});

export default app;
