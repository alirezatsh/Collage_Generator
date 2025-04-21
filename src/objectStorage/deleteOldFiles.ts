/* eslint-disable no-undef */
import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
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

export async function deleteOldImages() {
  const params = {
    Bucket: process.env.LIARA_BUCKET_NAME!,
  };

  try {
    const command = new ListObjectsCommand(params);
    const res = await client.send(command);

    if (!res.Contents || res.Contents.length === 0) {
      console.log('No files to delete.');
      return;
    }

    const rootFiles = res.Contents.filter((file) => !file.Key?.includes('/'));

    if (rootFiles.length === 0) {
      console.log('No files in the root directory to delete.');
      return;
    }

    const sortedFiles = rootFiles.sort((a, b) => {
      if (!a.LastModified || !b.LastModified) {
        return 0;
      }
      return (
        new Date(a.LastModified).getTime() - new Date(b.LastModified).getTime()
      );
    });

    for (const file of sortedFiles) {
      if (file.Key && file.LastModified) {
        // const fileTimestamp = new Date(file.LastModified).getTime();

        // const now = new Date().getTime();
        // const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        // if (now - fileTimestamp <= sevenDaysInMs) {
        //   continue;
        // }

        const deleteParams = {
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Key: file.Key,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await client.send(deleteCommand);

        console.log(`File deleted: ${file.Key}`);
      }
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}
