/* eslint-disable no-undef */
import { Worker, Job } from 'bullmq';
import redisConfig from '../config/redisConfig';
import processCollageJob from './processCollageJob';
import RequestModel from '../models/request';
import { logRequestStatus } from '../utils/loggerHelper';

const handleCollageJob = async (job: Job) => {
  const { images, collageType, borderSize, backgroundColor, requestId } =
    job.data;
  console.log(`Job received: ${job.id}`);
  const startTime = new Date();

  const logStep = async (
    message: string,
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELED'
  ) => {
    const now = new Date();
    try {
      await logRequestStatus(
        requestId,
        'p0Value',
        'p1Value',
        startTime,
        now,
        status,
        message
      );
    } catch (err) {
      console.error(
        `Error while logging step: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
    console.log(`🔹 [${status}] Job ${job.id}: ${message}`);
  };

  const checkCancellation = async () => {
    const request = await RequestModel.findById(requestId);
    if (request?.status === 'CANCELLED') {
      await logStep('Job was cancelled.', 'CANCELED');
      throw new Error('CANCELLED');
    }
  };

  try {
    await checkCancellation();
    await logStep('Job started.', 'PROCESSING');

    await logStep('Processing images...', 'PROCESSING');
    await checkCancellation();

    // Process the collage generation logic
    const { resultUrl } = await processCollageJob(
      images,
      collageType,
      borderSize,
      backgroundColor,
      async (msg: string) => {
        await checkCancellation();
        await logStep(msg, 'PROCESSING');
      }
    );

    await checkCancellation();
    await logStep('Uploading final collage...', 'PROCESSING');

    const updatedRequest = await RequestModel.findById(requestId);
    if (updatedRequest && updatedRequest.status !== 'CANCELLED') {
      updatedRequest.status = 'COMPLETED';
      updatedRequest.resultUrl = resultUrl;
      await updatedRequest.save();
    }

    await logStep('Collage processing completed successfully.', 'COMPLETED');
    return { resultUrl };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';

    if (errorMsg === 'CANCELLED') {
      console.log(`Job ${job.id} was cancelled by user.`);
      return;
    }

    await logStep(`Processing failed: ${errorMsg}`, 'FAILED');
    console.log(`Job ${job.id} failed! Error: ${errorMsg}`);
    throw err;
  }
};

// Create a BullMQ worker to process jobs from 'collageQueue'
const collageWorker = new Worker('collageQueue', handleCollageJob, {
  connection: redisConfig,
  concurrency: 1,
  lockDuration: 60000,
  stalledInterval: 30000,
  maxStalledCount: 2,
});

// Handle job completion
collageWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed! Result: ${JSON.stringify(result)}`);
});

// Handle job failure
collageWorker.on('failed', (job, err) => {
  const errorMsg = err instanceof Error ? err.message : 'Unknown error';
  if (errorMsg === 'CANCELLED') return;
  console.log(`Job ${job?.id ?? 'unknown'} failed! Error: ${errorMsg}`);
});

// If the worker is paused, cancel all jobs marked as 'PROCESSING'
collageWorker.on('paused', async () => {
  console.log('Worker has been paused.');

  const pendingRequests = await RequestModel.find({ status: 'PROCESSING' });
  for (const req of pendingRequests) {
    req.status = 'CANCELLED';
    await req.save();
    console.log(`Request ${req._id} canceled due to pause.`);
  }
});
