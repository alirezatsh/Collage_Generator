import { Worker } from 'bullmq';
import { connection } from './connection';
import RequestModel from '../models/request';

const collageWorker = new Worker(
  'collageQueue',
  async (job) => {
    const { requestId } = job.data;
    const request = await RequestModel.findById(requestId);
    if (!request) throw new Error('Request not found');

    await RequestModel.findByIdAndUpdate(requestId, { status: 'PROCESSING' });

    try {
      const resultUrl = `https://your-domain.com/output/${requestId}.jpg`;

      await RequestModel.findByIdAndUpdate(requestId, {
        status: 'COMPLETED',
        resultUrl,
      });
    } catch (err) {
      await RequestModel.findByIdAndUpdate(requestId, { status: 'FAILED' });
    }
  },
  { connection }
);

export default collageWorker;
