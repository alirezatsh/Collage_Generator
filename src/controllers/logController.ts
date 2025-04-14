import { Request, Response } from 'express';
import Log from '../models/logger';

export const getLogsByRequestId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { requestId } = req.params;

  try {
    const logs = await Log.find({ request: requestId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Logs fetched successfully',
      data: logs,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching logs', error: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error while fetching logs' });
    }
  }
};

export const getAllLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All logs fetched successfully',
      data: logs,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error fetching logs', error: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error while fetching logs' });
    }
  }
};
