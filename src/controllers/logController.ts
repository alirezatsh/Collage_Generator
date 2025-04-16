import { Request, Response } from 'express';
import Log from '../models/logger';

export const getLogsByRequestId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { requestId } = req.params;

  try {
    // Fetch all logs from the database and sort them by creation time (newest first)
    const logs = await Log.find({ request: requestId }).sort({ createdAt: -1 });

    if (logs.length === 0) {
      res
        .status(404)
        .json({ message: 'No logs found for the given request ID' });
      return;
    }

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

    if (logs.length === 0) {
      res.status(404).json({ message: 'No logs found' });
      return;
    }

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
