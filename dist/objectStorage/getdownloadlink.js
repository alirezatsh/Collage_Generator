"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateDownloadLink = async (filename) => {
    const client = new client_s3_1.S3Client({
        region: 'default',
        endpoint: process.env.LIARA_ENDPOINT,
        credentials: {
            accessKeyId: process.env.LIARA_ACCESS_KEY,
            secretAccessKey: process.env.LIARA_SECRET_KEY,
        },
    });
    const fileKey = `collages/${filename}`;
    const params = {
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileKey,
    };
    const command = new client_s3_1.GetObjectCommand(params);
    try {
        const url = await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: 3600 });
        return url;
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};
exports.default = generateDownloadLink;
