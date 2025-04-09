import { Request, Response } from 'express';
import { Queue, Job } from 'bullmq';
import redisConfig from '../config/redisConfig';

const collageQueue = new Queue('collageQueue', {
  connection: redisConfig,
});

export const getJobStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const jobId = req.params.jobId;
    const job = await collageQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    res.status(200).json({
      jobId: job.id,
      status: job.finishedOn
        ? 'COMPLETED'
        : job.isFailed()
          ? 'FAILED'
          : 'PROCESSING',
      resultUrl: job.finishedOn ? job.returnvalue?.resultUrl : null,
    });
  } catch (error: unknown) {
    res.status(500).json({
      message: 'Error fetching job status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
