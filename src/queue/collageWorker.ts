/* eslint-disable no-undef */
import { Worker, Job } from 'bullmq';
import redisConfig from '../config/redisConfig';
import processCollageJob from './processCollageJob';
import RequestModel from '../models/request';
import { logRequestStatus } from '../utils/loggerHelper';

const collageWorker = new Worker(
  'collageQueue',
  async (job: Job) => {
    const { images, collageType, borderSize, backgroundColor, requestId } =
      job.data;
    console.log(`Processing collage for job: ${job.id}`);

    const startTime = new Date();

    try {
      const { resultUrl } = await processCollageJob(
        images,
        collageType,
        borderSize,
        backgroundColor,
        async (msg: any) => {
          console.log(msg); // log message callback
        }
      );

      // Update request status in database
      const request = await RequestModel.findById(requestId);
      if (request) {
        request.status = 'COMPLETED';
        request.resultUrl = resultUrl;
        await request.save();
      }

      const endTime = new Date();
      await logRequestStatus(
        requestId,
        'p0Value',
        'p1Value',
        startTime,
        endTime,
        'COMPLETED',
        'Collage processing completed successfully.'
      );

      return { resultUrl };
    } catch (err) {
      const endTime = new Date();
      await logRequestStatus(
        requestId,
        'p0Value',
        'p1Value',
        startTime,
        endTime,
        'FAILED',
        `Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );

      console.log(
        `Job ${job.id} failed! Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
      throw err; // Re-throw error after logging
    }
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
    if (err instanceof Error) {
      console.log(`Job ${job.id} failed! Error: ${err.message}`);
    } else {
      console.log('Job failed with an unknown error!');
    }
  } else {
    console.log('Job is undefined!');
  }
});
