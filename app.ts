import express, { Request, Response } from 'express';
import connectToDb from './src/config/mongodbConfig';
import imageRoutes from './src/routes/requestRoute';
import './src/queue/collageWorker';
import { deleteOldFiles } from './src/objectStorage/deleteOldFiles';

deleteOldFiles();

const app = express();

app.use(express.json());
app.use('/api', imageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Collage Generator API is running 🚀');
});

connectToDb();

export default app;
