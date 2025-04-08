/* eslint-disable no-undef */
import { Worker, Job } from 'bullmq';
import redisConfig from '../config/redisconfig';
import processCollageJob from './processCollageJob';
import RequestModel from '../models/request';

const collageWorker = new Worker(
  'collageQueue',
  async (job: Job) => {
    const { images, collageType, borderSize, borderColor, requestId } =
      job.data;
    console.log(`Processing collage for job: ${job.id}`);

    const { resultUrl } = await processCollageJob(
      images,
      collageType,
      borderSize,
      borderColor
    );

    const request = await RequestModel.findById(requestId);
    if (request) {
      request.status = 'COMPLETED';
      request.resultUrl = resultUrl;
      await request.save();
    }

    return { resultUrl };
  },
  {
    connection: redisConfig,
  }
);

collageWorker.on('completed', (job, result) => {
  if (job) {
    console.log(`Job ${job.id} completed! Result: ${JSON.stringify(result)}`);
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
