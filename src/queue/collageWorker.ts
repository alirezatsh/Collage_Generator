/* eslint-disable no-undef */
import { Worker, Job } from 'bullmq';
import redisConfig from '../config/redisConfig';
import processCollageJob from './processCollageJob';
import RequestModel from '../models/request';
import { logRequestStatus } from '../utils/loggerHelper';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  try {
    const request = await RequestModel.findById(requestId);
    if (request && request.status === 'CANCELLED') {
      await logStep('Job has been cancelled.', 'CANCELED');
      throw new Error('Job was cancelled.');
    }

    await logStep('Started collage processing...', 'PROCESSING');

    await sleep(15000);

    const updatedRequest = await RequestModel.findById(requestId);
    if (updatedRequest && updatedRequest.status === 'CANCELLED') {
      await logStep('Job was cancelled during processing.', 'CANCELED');
      throw new Error('Job was cancelled during processing.');
    }

    const { resultUrl } = await processCollageJob(
      images,
      collageType,
      borderSize,
      backgroundColor,
      async (msg: string) => {
        await logStep(msg, 'PROCESSING');
      }
    );

    if (updatedRequest && updatedRequest.status !== 'CANCELLED') {
      updatedRequest.status = 'COMPLETED';
      updatedRequest.resultUrl = resultUrl;
      await updatedRequest.save();
    }

    await logStep('Collage processing completed successfully.', 'COMPLETED');
    return { resultUrl };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    await logStep(`Processing failed: ${errorMsg}`, 'FAILED');
    console.log(`Job ${job.id} failed! Error: ${errorMsg}`);
    throw err;
  }
};

const collageWorker = new Worker('collageQueue', handleCollageJob, {
  connection: redisConfig,
});

collageWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed! Result: ${JSON.stringify(result)}`);
});

collageWorker.on('failed', (job, err) => {
  const errorMsg = err instanceof Error ? err.message : 'Unknown error';
  console.log(`Job ${job?.id ?? 'unknown'} failed! Error: ${errorMsg}`);
});

collageWorker.on('paused', async () => {
  console.log('Worker has been paused.');

  const pendingRequests = await RequestModel.find({ status: 'PROCESSING' });

  for (const req of pendingRequests) {
    req.status = 'CANCELLED';
    await req.save();
    console.log(`Request ${req._id} canceled due to pause.`);
  }
});
