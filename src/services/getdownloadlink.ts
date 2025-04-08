// src/services/getdownloadlink.ts
/* eslint-disable no-undef */
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const generateDownloadLink = async (filename: string): Promise<string> => {
  const client = new S3Client({
    region: 'default',
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
      accessKeyId: process.env.LIARA_ACCESS_KEY!,
      secretAccessKey: process.env.LIARA_SECRET_KEY!,
    },
  });

  const params = {
    Bucket: process.env.LIARA_BUCKET_NAME!,
    Key: filename,
  };

  const command = new GetObjectCommand(params);
  try {
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

export default generateDownloadLink;
