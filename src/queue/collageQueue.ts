import { Queue } from 'bullmq';
import redisConfig from '../config/redisConfig';

const collageQueue = new Queue('collageQueue', {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export default collageQueue;
