import express, { Request, Response } from 'express';
import connectToDb from './config/db';
import imageRoutes from './routes/imageroute';
import '../src/services/collageworker';
import { deleteOldFiles } from './services/deleteoldfiles';

deleteOldFiles();

const app = express();

app.use(express.json());
app.use('/api', imageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Collage Generator API is running 🚀');
});

connectToDb();

export default app;
