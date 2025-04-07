/* eslint-disable no-undef */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const client = new S3Client({
  region: 'default',
  endpoint: process.env.LIARA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY!,
    secretAccessKey: process.env.LIARA_SECRET_KEY!,
  },
});

const uploadFileToLiara = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  const params = {
    Body: fileBuffer,
    Bucket: process.env.LIARA_BUCKET_NAME!,
    Key: fileName,
    ContentType: contentType,
  };

  try {
    await client.send(new PutObjectCommand(params));

    // پس از آپلود، URL تصویر را دریافت می‌کنیم.
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.LIARA_BUCKET_NAME!,
        Key: fileName,
      }),
      { expiresIn: 3600 }
    );

    console.log('Upload successful!');
    return url; // URL مستقیم فایل
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('Failed to upload file');
  }
};

export default uploadFileToLiara;
