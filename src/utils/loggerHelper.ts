import Log from '../models/logger';
import mongoose from 'mongoose';

export const logRequestStatus = async (
  requestId: mongoose.Schema.Types.ObjectId,
  p0: string,
  p1: string,
  startTime: Date,
  endTime: Date | null,
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELED',
  message: string
) => {
  const logEntry = new Log({
    request: requestId,
    status,
    message,
    startTime,
    endTime,
    duration: endTime
      ? (endTime.getTime() - startTime.getTime()) / 1000
      : undefined,
  });

  await logEntry.save();
  return logEntry;
};
