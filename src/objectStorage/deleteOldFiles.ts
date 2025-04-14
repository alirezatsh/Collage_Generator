/* eslint-disable no-undef */
import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import cron from 'node-cron';
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
  const limit = 7 * 24 * 60 * 60 * 1000;
  const now = new Date().getTime();
  const objToDel: { Key: string }[] = [];

  const params = {
    Bucket: process.env.BUCKET!,
  };

  try {
    const command = new ListObjectsCommand(params);
    const res = await client.send(command);

    res.Contents?.forEach((file) => {
      if (file.Key !== 'collage/results/') {
        const fileLastModified = new Date(file.LastModified!).getTime();
        if (fileLastModified < now - limit) {
          objToDel.push({ Key: file.Key! });
        }
      }
    });

    if (objToDel.length === 0) {
      console.log('No old file to delete');
      return;
    }

    const delParams = {
      Bucket: process.env.BUCKET!,
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

cron.schedule('* * * * *', () => {
  console.log('Running task to delete old images...');
  deleteOldImages();
});

console.log('Cron job started...');
