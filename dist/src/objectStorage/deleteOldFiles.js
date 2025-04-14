"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldImages = deleteOldImages;
const client_s3_1 = require("@aws-sdk/client-s3");
const node_cron_1 = __importDefault(require("node-cron"));
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
    const limit = 7 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const objToDel = [];
    const params = {
        Bucket: process.env.BUCKET,
    };
    try {
        const command = new client_s3_1.ListObjectsCommand(params);
        const res = await client.send(command);
        res.Contents?.forEach((file) => {
            if (file.Key !== 'collage/results/') {
                const fileLastModified = new Date(file.LastModified).getTime();
                if (fileLastModified < now - limit) {
                    objToDel.push({ Key: file.Key });
                }
            }
        });
        if (objToDel.length === 0) {
            console.log('No old file to delete');
            return;
        }
        const delParams = {
            Bucket: process.env.BUCKET,
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
node_cron_1.default.schedule('* * * * *', () => {
    console.log('Running task to delete old images...');
    deleteOldImages();
});
console.log('Cron job started...');
