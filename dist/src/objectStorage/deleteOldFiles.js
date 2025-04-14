"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldFiles = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new client_s3_1.S3Client({
    region: 'default',
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY,
        secretAccessKey: process.env.LIARA_SECRET_KEY,
    },
});
const BUCKET_NAME = process.env.LIARA_BUCKET_NAME;
const DAYS_OLD = 3;
const getCurrentTimeInMillis = () => new Date().getTime();
const isFileOld = (lastModified) => {
    const currentTime = getCurrentTimeInMillis();
    const fileTime = lastModified.getTime();
    const timeDifference = currentTime - fileTime;
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference > DAYS_OLD;
};
const deleteOldFiles = async () => {
    let continuationToken = undefined;
    try {
        const listParams = {
            Bucket: BUCKET_NAME,
        };
        const listData = await client.send(new client_s3_1.ListObjectsV2Command(listParams));
        console.log('Files before deletion:', listData);
        do {
            const params = {
                Bucket: BUCKET_NAME,
                ContinuationToken: continuationToken,
            };
            const data = await client.send(new client_s3_1.ListObjectsV2Command(params));
            if (data.Contents) {
                for (const file of data.Contents) {
                    if (file.LastModified && isFileOld(file.LastModified)) {
                        const deleteParams = {
                            Bucket: BUCKET_NAME,
                            Key: file.Key,
                        };
                        await client.send(new client_s3_1.DeleteObjectCommand(deleteParams));
                        console.log(`File deleted: ${file.Key}`);
                    }
                }
            }
            continuationToken = data.NextContinuationToken;
        } while (continuationToken);
        console.log('Finished deleting old files.');
        const postDeleteData = await client.send(new client_s3_1.ListObjectsV2Command(listParams));
        console.log('Files after deletion:', postDeleteData);
    }
    catch (error) {
        console.error('Error deleting old files:', error);
    }
};
exports.deleteOldFiles = deleteOldFiles;
