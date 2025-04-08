"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uploadToLiara = async (fileBuffer, filename) => {
    const client = new client_s3_1.S3Client({
        region: 'default',
        endpoint: process.env.LIARA_ENDPOINT,
        credentials: {
            accessKeyId: process.env.LIARA_ACCESS_KEY,
            secretAccessKey: process.env.LIARA_SECRET_KEY,
        },
    });
    const folderPath = 'collages/';
    const params = {
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: folderPath + filename,
        Body: fileBuffer,
        ContentType: 'image/jpeg',
    };
    try {
        const data = await client.send(new client_s3_1.PutObjectCommand(params));
        console.log('File uploaded successfully:', data);
    }
    catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
exports.default = uploadToLiara;
