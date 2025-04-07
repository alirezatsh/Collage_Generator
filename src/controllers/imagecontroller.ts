/* eslint-disable no-undef */
import { Request, Response } from 'express';
import uploadFileToLiara from '../services/imageuploader';

export const uploadImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { type, borderSize, borderColor } = req.body;

    if (!files || files.length !== 3) {
      res.status(400).json({ message: 'Exactly 3 images are required' });
      return;
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        // در اینجا باید از سرویس آپلود استفاده کنید و URL تصویر را دریافت کنید.
        const uploadedImageUrl = await uploadFileToLiara(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        return uploadedImageUrl; // برگرداندن URL تصویر به کنترلر
      })
    );

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: uploadedImages, // ارسال URLهای تصاویر آپلود شده
      type,
      borderSize,
      borderColor,
    });
  } catch (error: unknown) {
    // بررسی نوع خطا
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    } else {
      console.error('An unknown error occurred');
      res
        .status(500)
        .json({ message: 'Upload failed', error: 'An unknown error occurred' });
    }
  }
};
