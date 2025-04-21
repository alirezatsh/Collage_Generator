import express, { Request, Response } from 'express';
import requestRoutes from './src/routes/requestRoute';
import logRoutes from './src/routes/logsRoute';
import './src/queue/collageWorker';
import cron from 'node-cron';
import { deleteOldImages } from './src/objectStorage/deleteOldFiles';

const app = express();

app.use(express.json());

app.use('/api', requestRoutes, logRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Collage Generator API is running');
});

cron.schedule('0 0 3/* * *', async () => {
  // eslint-disable-next-line no-undef
  console.log('Running task to delete old files...');
  await deleteOldImages();
});

export default app;
