/* eslint-disable no-undef */
import { Request, Response } from 'express';
import RequestModel from '../models/request';
import collageQueue from '../services/collagequeue'; // فرض کنید این وظیفه صف کلاژ است

export const uploadImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { collageType, borderSize, borderColor } = req.body;

    if (!files || files.length !== 3) {
      res.status(400).json({ message: 'Exactly 3 images are required' });
      return;
    }

    // ذخیره درخواست جدید در دیتابیس
    const newRequest = new RequestModel({
      images: files.map((file) => file.originalname),
      collageType,
      borderSize,
      borderColor,
      status: 'PENDING', // وضعیت اولیه "PENDING"
    });

    await newRequest.save();

    // اضافه کردن درخواست به صف
    await createCollageJob(newRequest);

    res.status(200).json({
      message: 'Images uploaded successfully and collage is being processed',
      requestId: newRequest._id,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'Upload failed', error: 'An unknown error occurred' });
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
      res
        .status(500)
        .json({ message: 'Error fetching status', error: error.message });
    } else {
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

    // درخواست‌هایی که پردازش شده‌اند قابل لغو نیستند
    if (request.status === 'COMPLETED' || request.status === 'FAILED') {
      res
        .status(400)
        .json({ message: 'Cannot cancel completed or failed request' });
      return;
    }

    // تغییر وضعیت درخواست به "CANCELLED"
    request.status = 'CANCELLED';
    await request.save();

    // لغو Job از صف
    await cancelCollageJob(request._id as string); // تایید نوع به عنوان string

    res.status(200).json({ message: 'Request cancelled successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: 'Error cancelling request', error: error.message });
    } else {
      res.status(500).json({
        message: 'Error cancelling request',
        error: 'An unknown error occurred',
      });
    }
  }
};

// تابع ایجاد Job در صف برای پردازش کلاژ
const createCollageJob = async (request: any): Promise<void> => {
  try {
    const { images, collageType, borderSize, borderColor } = request;

    // ارسال Job به صف
    const job = await collageQueue.add('createCollage', {
      images,
      collageType,
      borderSize,
      borderColor,
      requestId: request._id as string, // تایید نوع به عنوان string
    });

    console.log(`Job ${job.id} added to queue`); // استفاده از job

    // به روزرسانی وضعیت درخواست به "PROCESSING"
    request.status = 'PROCESSING';
    await request.save();
  } catch (error: unknown) {
    console.error('Error adding job to queue:', error);
  }
};

// تابع لغو Job از صف
const cancelCollageJob = async (requestId: string): Promise<void> => {
  try {
    // لغو Job از صف با شناسه درخواست
    const jobs = await collageQueue.getJobs(['waiting', 'active', 'delayed']);

    for (const job of jobs) {
      if (job.data.requestId === requestId) {
        await job.remove(); // حذف Job از صف
        console.log(`Job for request ${requestId} removed from queue`);
        break;
      }
    }
  } catch (error: unknown) {
    console.error('Error canceling job from queue:', error);
  }
};
