/* eslint-disable no-undef */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const uploadToLiara = async (fileBuffer: Buffer, filename: string) => {
  const client = new S3Client({
    region: 'default',
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
      accessKeyId: process.env.LIARA_ACCESS_KEY!,
      secretAccessKey: process.env.LIARA_SECRET_KEY!,
    },
  });

  const folderPath = 'collages/';

  const params = {
    Bucket: process.env.LIARA_BUCKET_NAME!,
    Key: folderPath + filename,
    Body: fileBuffer,
    ContentType: 'image/jpeg',
  };

  try {
    const data = await client.send(new PutObjectCommand(params));
    console.log('File uploaded successfully:', data);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export default uploadToLiara;
