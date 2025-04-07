import { Queue } from 'bullmq';
import redisConfig from '../config/redisconfig'; // کانفیگ Redis که نوشتی

const collageQueue = new Queue('collageQueue', {
  connection: redisConfig,
});

export default collageQueue;
