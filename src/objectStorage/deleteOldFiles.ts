/* eslint-disable no-undef */
import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectsCommand,
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
  const limit = 7 * 24 * 60 * 60 * 1000; // Define time limit: 7 days in milliseconds
  const now = new Date().getTime();
  const objToDel: { Key: string }[] = [];

  const params = {
    Bucket: process.env.LIARA_BUCKET_NAME!,
  };

  try {
    const command = new ListObjectsCommand(params);
    const res = await client.send(command);

    res.Contents?.forEach((file) => {
      const key = file.Key!;

      const isRootLevel = !key.includes('/'); // Only consider root-level files (not inside folders)

      if (isRootLevel) {
        // Check if the file is older than 7 days
        const fileLastModified = new Date(file.LastModified!).getTime();
        if (fileLastModified < now - limit) {
          objToDel.push({ Key: key });
        }
      }
    });

    if (objToDel.length === 0) {
      console.log('No old file to delete');
      return;
    }

    const delParams = {
      Bucket: process.env.LIARA_BUCKET_NAME!,
      Delete: {
        Objects: objToDel,
      },
    };

    const delCommand = new DeleteObjectsCommand(delParams);
    await client.send(delCommand);

    console.log('Old images deleted successfully');
  } catch (err) {
    console.log('Error deleting files:', err);
  }
}
