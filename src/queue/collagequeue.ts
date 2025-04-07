import { Queue } from 'bullmq';
import { connection } from './connection';

export const collageQueue = new Queue('collageQueue', {
  connection,
});
