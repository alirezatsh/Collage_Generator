/* eslint-disable no-undef */
import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2Output,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
// import cron from 'node-cron';

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

// Function to delete old files
export const deleteOldFiles = async (): Promise<void> => {
  let continuationToken: string | undefined = undefined;

  try {
    // Log files before deletion for testing
    const listParams = {
      Bucket: BUCKET_NAME,
    };
    const listData = await client.send(new ListObjectsV2Command(listParams));
    console.log('Files before deletion:', listData);

    // Pagination loop
    do {
      const params: ListObjectsV2CommandInput = {
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      };

      const data: ListObjectsV2Output = await client.send(
        new ListObjectsV2Command(params)
      );

      if (data.Contents) {
        for (const file of data.Contents) {
          if (file.LastModified && isFileOld(file.LastModified)) {
            const deleteParams = {
              Bucket: BUCKET_NAME,
              Key: file.Key!,
            };

            // Delete file asynchronously
            await client.send(new DeleteObjectCommand(deleteParams));
            console.log(`File deleted: ${file.Key}`);
          }
        }
      }

      // Set continuationToken for next page
      continuationToken = data.NextContinuationToken;
    } while (continuationToken);

    console.log('Finished deleting old files.');

    // Log files after deletion for testing
    const postDeleteData = await client.send(
      new ListObjectsV2Command(listParams)
    );
    console.log('Files after deletion:', postDeleteData);
  } catch (error) {
    console.error('Error deleting old files:', error);
  }
};
