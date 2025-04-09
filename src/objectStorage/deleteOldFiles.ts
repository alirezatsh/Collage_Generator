/* eslint-disable no-undef */
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// S3 Client Configuration
const client = new S3Client({
  region: 'default',
  endpoint: process.env.LIARA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY!,
    secretAccessKey: process.env.LIARA_SECRET_KEY!,
  },
});

const BUCKET_NAME = process.env.LIARA_BUCKET_NAME!;
const DAYS_OLD = 3;

const getCurrentTimeInMillis = (): number => new Date().getTime();

const isFileOld = (lastModified: Date): boolean => {
  const currentTime = getCurrentTimeInMillis();
  const fileTime = lastModified.getTime();
  const timeDifference = currentTime - fileTime;
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  return daysDifference > DAYS_OLD;
};

export const deleteOldFiles = async (): Promise<void> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
    };

    const data = await client.send(new ListObjectsV2Command(params));

    if (data.Contents) {
      for (const file of data.Contents) {
        if (file.LastModified && isFileOld(file.LastModified)) {
          const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: file.Key!,
          };

          await client.send(new DeleteObjectCommand(deleteParams));
          console.log(`File deleted: ${file.Key}`);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting old files:', error);
  }
};
