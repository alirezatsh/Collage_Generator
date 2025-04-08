import { Queue } from 'bullmq';
import redisConfig from '../config/redisconfig';

const collageQueue = new Queue('collageQueue', {
  connection: redisConfig,
});

export default collageQueue;
