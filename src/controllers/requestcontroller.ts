/* eslint-disable no-undef */
import { Request, Response } from 'express';
import RequestModel from '../models/request';
import collageQueue from '../queue/collageQueue';
import uploadFileToLiara from '../objectStorage/uploadImagesToS3';

const createCollageJob = async (request: any): Promise<void> => {
  try {
    const { images, collageType, borderSize, backgroundColor, resultUrl } =
      request;

    const job = await collageQueue.add('createCollage', {
      images,
      collageType,
      borderSize,
      backgroundColor,
      resultUrl,
      requestId: request._id as string,
    });

    console.log(`Job ${job.id} added to queue`);

    request.status = 'PROCESSING';
    await request.save();
  } catch (error: unknown) {
    console.error('Error adding job to queue:', error);
  }
};

const cancelCollageJob = async (requestId: string): Promise<void> => {
  try {
    const jobs = await collageQueue.getJobs(['waiting', 'active', 'delayed']);

    for (const job of jobs) {
      if (job.data.requestId === requestId) {
        await job.remove();
        console.log(`Job for request ${requestId} removed from queue`);

        const request = await RequestModel.findById(requestId);
        if (request) {
          request.status = 'CANCELLED';
          await request.save();
        }
        break;
      }
    }
  } catch (error: unknown) {
    console.error('Error canceling job from queue:', error);
  }
};

export const uploadImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { collageType, borderSize, backgroundColor } = req.body;

    if (!files || files.length < 2) {
      res.status(400).json({ message: 'At least 2 images are required' });
      return;
    }

    if (!collageType || !borderSize || !backgroundColor) {
      res
        .status(400)
        .json({ message: 'Missing collage configuration parameters' });
      return;
    }

    const uploadedImages: string[] = [];

    for (const file of files) {
      const fileName = file.originalname;
      const fileBuffer = file.buffer;
      const uploadedUrl = await uploadFileToLiara(fileBuffer, fileName);
      uploadedImages.push(uploadedUrl);
    }

    const newRequest = new RequestModel({
      images: uploadedImages,
      collageType,
      borderSize,
      backgroundColor,
      status: 'PROCESSING',
    });

    await newRequest.save();

    await createCollageJob(newRequest);

    res.status(200).json({
      message: 'Images uploaded successfully and collage is being processed',
      requestId: newRequest._id,
      status: newRequest.status,
      resultUrl: newRequest.resultUrl,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    } else {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Upload failed', error: 'An unknown error occurred' });
    }
  }
};

export const getAllRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const requests = await RequestModel.find();

    if (requests.length === 0) {
      res.status(404).json({ message: 'No requests found' });
      return;
    }

    const requestsWithResultUrl = requests.map((req) => ({
      ...req.toObject(),
      resultUrl: req.resultUrl,
    }));

    res.status(200).json({
      message: 'Requests fetched successfully',
      data: requestsWithResultUrl,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res
        .status(500)
        .json({ message: 'Error fetching requests', error: error.message });
    } else {
      console.error(error);
      res.status(500).json({
        message: 'Error fetching requests',
        error: 'An unknown error occurred',
      });
    }
  }
};

export const getCollageStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { requestId } = req.params;

  try {
    const request = await RequestModel.findById(requestId);

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    res.status(200).json({
      requestId: request._id,
      status: request.status,
      resultUrl: request.resultUrl,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res
        .status(500)
        .json({ message: 'Error fetching status', error: error.message });
    } else {
      console.error(error);
      res.status(500).json({
        message: 'Error fetching status',
        error: 'An unknown error occurred',
      });
    }
  }
};

export const cancelCollageRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { requestId } = req.params;

  try {
    const request = await RequestModel.findById(requestId);

    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (request.status === 'COMPLETED' || request.status === 'FAILED') {
      res
        .status(400)
        .json({ message: 'Cannot cancel completed or failed request' });
      return;
    }

    if (request.status === 'CANCELLED') {
      res.status(400).json({ message: 'Request is already cancelled' });
      return;
    }

    request.status = 'CANCELLED';
    await request.save();

    await cancelCollageJob(request._id as string);

    res.status(200).json({ message: 'Request cancelled successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res
        .status(500)
        .json({ message: 'Error cancelling request', error: error.message });
    } else {
      console.error(error);
      res.status(500).json({
        message: 'Error cancelling request',
        error: 'An unknown error occurred',
      });
    }
  }
};
