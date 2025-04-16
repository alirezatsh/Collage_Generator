import { Queue } from 'bullmq';
import redisConfig from '../config/redisConfig';

const collageQueue = new Queue('collageQueue', {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: true, // Remove job from Redis after successful completion
    removeOnFail: false, // Keep failed jobs in Redis for debugging
    attempts: 3, // Retry a failed job up to 3 times
    backoff: {
      type: 'exponential', // Use exponential backoff strategy between retries
      delay: 5000, // Initial delay of 5 seconds before retrying
    },
  },
});

export default collageQueue;
