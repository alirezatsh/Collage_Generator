"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
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
const uploadFileToLiara = async (fileBuffer, fileName, contentType = 'image/jpeg') => {
    const params = {
        Body: fileBuffer,
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
    };
    try {
        await client.send(new client_s3_1.PutObjectCommand(params));
        const url = await (0, s3_request_presigner_1.getSignedUrl)(client, new client_s3_1.GetObjectCommand({
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: fileName,
        }), { expiresIn: 3600 });
        console.log('Upload successful!');
        return url;
    }
    catch (error) {
        console.error('Upload failed:', error);
        throw new Error('Failed to upload file');
    }
};
exports.default = uploadFileToLiara;
