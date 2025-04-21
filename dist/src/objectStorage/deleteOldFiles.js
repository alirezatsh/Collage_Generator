"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
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
    const objToDel = [];
    const params = {
        Bucket: process.env.LIARA_BUCKET_NAME,
    };
    try {
        const command = new client_s3_1.ListObjectsCommand(params);
        const res = await client.send(command);
        for (const file of res.Contents || []) {
            const key = file.Key;
            const isRootLevel = !key.includes('/');
            if (isRootLevel) {
                objToDel.push({ Key: key });
            }
        }
        if (objToDel.length === 0) {
            console.log('No files to delete');
            return;
        }
        const delParams = {
            Bucket: process.env.LIARA_BUCKET_NAME,
            Delete: {
                Objects: objToDel,
            },
        };
        const delCommand = new client_s3_1.DeleteObjectsCommand(delParams);
        await client.send(delCommand);
        console.log('Old images deleted successfully');
    }
    catch (err) {
        console.log('Error deleting files:', err);
    }
}
node_cron_1.default.schedule('* * * * *', async () => {
    console.log('Running task to delete old files...');
    await deleteOldImages();
});
