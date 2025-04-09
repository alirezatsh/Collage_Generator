import { Queue } from 'bullmq';
import redisConfig from '../config/redisConfig';

const collageQueue = new Queue('collageQueue', {
  connection: redisConfig,
});

export default collageQueue;
