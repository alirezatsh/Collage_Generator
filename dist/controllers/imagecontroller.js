"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const imageuploader_1 = __importDefault(require("../services/imageuploader"));
const uploadImages = async (req, res) => {
    try {
        const files = req.files;
        const { type, borderSize, borderColor } = req.body;
        if (!files || files.length !== 3) {
            res.status(400).json({ message: 'Exactly 3 images are required' });
            return;
        }
        const uploadedImages = await Promise.all(files.map(async (file) => {
            const uploadedImageUrl = await (0, imageuploader_1.default)(file.buffer, file.originalname, file.mimetype);
            return uploadedImageUrl;
        }));
        res.status(200).json({
            message: 'Images uploaded successfully',
            images: uploadedImages,
            type,
            borderSize,
            borderColor,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: 'Upload failed', error: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res
                .status(500)
                .json({ message: 'Upload failed', error: 'An unknown error occurred' });
        }
    }
};
exports.uploadImages = uploadImages;
