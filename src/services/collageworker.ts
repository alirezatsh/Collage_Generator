/* eslint-disable no-undef */
import { Worker, Job } from 'bullmq';
import redisConfig from '../config/redisconfig'; // کانفیگ Redis که نوشتی
import { createCollage } from './collagemaker'; // تابعی که برای پردازش کلاژ ایجاد می‌کنیم

// ایجاد Worker برای پردازش کلاژها
const collageWorker = new Worker(
  'collageQueue',
  async (job: Job) => {
    const { images, collageType, borderSize, borderColor } = job.data;
    console.log(`Processing collage for job: ${job.id}`);

    // پردازش کلاژ
    const resultUrl = await createCollage(
      images,
      collageType,
      borderSize,
      borderColor
    );

    return { resultUrl };
  },
  {
    connection: redisConfig,
  }
);

collageWorker.on('completed', (job, result) => {
  if (job) {
    console.log(`Job ${job.id} completed! Result: ${result}`);
  } else {
    console.log('Job is undefined!');
  }
});

collageWorker.on('failed', (job, err) => {
  if (job) {
    console.log(`Job ${job.id} failed! Error: ${err.message}`);
  } else {
    console.log('Job is undefined!');
  }
});
