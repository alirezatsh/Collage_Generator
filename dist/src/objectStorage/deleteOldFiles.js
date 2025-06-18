"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldImages = deleteOldImages;
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
async function deleteOldImages() {
    const params = {
        Bucket: process.env.LIARA_BUCKET_NAME,
    };
    try {
        const command = new client_s3_1.ListObjectsCommand(params);
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
            return (new Date(a.LastModified).getTime() - new Date(b.LastModified).getTime());
        });
        for (const file of sortedFiles) {
            if (file.Key && file.LastModified) {
                const deleteParams = {
                    Bucket: process.env.LIARA_BUCKET_NAME,
                    Key: file.Key,
                };
                const deleteCommand = new client_s3_1.DeleteObjectCommand(deleteParams);
                await client.send(deleteCommand);
                console.log(`File deleted: ${file.Key}`);
            }
        }
    }
    catch (err) {
        console.error('Error deleting file:', err);
    }
}
