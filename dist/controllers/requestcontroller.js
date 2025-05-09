"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelCollageRequest = exports.getCollageStatus = exports.getAllRequests = exports.uploadImages = void 0;
const request_1 = __importDefault(require("../models/request"));
const collagequeue_1 = __importDefault(require("../queue/collagequeue"));
const uploadImagesToS3_1 = __importDefault(require("../objectStorage/uploadImagesToS3"));
const createCollageJob = async (request) => {
    try {
        const { images, collageType, borderSize, backgroundColor, resultUrl } = request;
        const job = await collagequeue_1.default.add('createCollage', {
            images,
            collageType,
            borderSize,
            backgroundColor,
            resultUrl,
            requestId: request._id,
        });
        console.log(`Job ${job.id} added to queue`);
        request.status = 'PROCESSING';
        await request.save();
    }
    catch (error) {
        console.error('Error adding job to queue:', error);
    }
};
const cancelCollageJob = async (requestId) => {
    try {
        const jobs = await collagequeue_1.default.getJobs(['waiting', 'active', 'delayed']);
        for (const job of jobs) {
            if (job.data.requestId === requestId) {
                await job.remove();
                console.log(`Job for request ${requestId} removed from queue`);
                break;
            }
        }
    }
    catch (error) {
        console.error('Error canceling job from queue:', error);
    }
};
const uploadImages = async (req, res) => {
    try {
        const files = req.files;
        const { collageType, borderSize, backgroundColor } = req.body;
        if (!files || files.length !== 3) {
            res.status(400).json({ message: 'Exactly 3 images are required' });
            return;
        }
        const uploadedImages = [];
        for (const file of files) {
            const fileName = file.originalname;
            const fileBuffer = file.buffer;
            const uploadedUrl = await (0, uploadImagesToS3_1.default)(fileBuffer, fileName);
            uploadedImages.push(uploadedUrl);
        }
        const newRequest = new request_1.default({
            images: uploadedImages,
            collageType,
            borderSize,
            backgroundColor,
            status: 'PENDING',
        });
        await newRequest.save();
        await createCollageJob(newRequest);
        res.status(200).json({
            message: 'Images uploaded successfully and collage is being processed',
            requestId: newRequest._id,
            status: newRequest.status,
            resultUrl: newRequest.resultUrl,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: 'Upload failed', error: error.message });
        }
        else {
            res
                .status(500)
                .json({ message: 'Upload failed', error: 'An unknown error occurred' });
        }
    }
};
exports.uploadImages = uploadImages;
const getAllRequests = async (req, res) => {
    try {
        const requests = await request_1.default.find();
        const requestsWithResultUrl = requests.map((req) => ({
            ...req.toObject(),
            resultUrl: req.resultUrl,
        }));
        res.status(200).json({
            message: 'Requests fetched successfully',
            data: requestsWithResultUrl,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res
                .status(500)
                .json({ message: 'Error fetching requests', error: error.message });
        }
        else {
            res.status(500).json({
                message: 'Error fetching requests',
                error: 'An unknown error occurred',
            });
        }
    }
};
exports.getAllRequests = getAllRequests;
const getCollageStatus = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await request_1.default.findById(requestId);
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        res.status(200).json({
            requestId: request._id,
            status: request.status,
            resultUrl: request.resultUrl,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res
                .status(500)
                .json({ message: 'Error fetching status', error: error.message });
        }
        else {
            res.status(500).json({
                message: 'Error fetching status',
                error: 'An unknown error occurred',
            });
        }
    }
};
exports.getCollageStatus = getCollageStatus;
const cancelCollageRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await request_1.default.findById(requestId);
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        if (request.status === 'COMPLETED' || request.status === 'FAILED') {
            res
                .status(400)
                .json({ message: 'Cannot cancel completed or failed request' });
            return;
        }
        request.status = 'CANCELLED';
        await request.save();
        await cancelCollageJob(request._id);
        res.status(200).json({ message: 'Request cancelled successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res
                .status(500)
                .json({ message: 'Error cancelling request', error: error.message });
        }
        else {
            res.status(500).json({
                message: 'Error cancelling request',
                error: 'An unknown error occurred',
            });
        }
    }
};
exports.cancelCollageRequest = cancelCollageRequest;
