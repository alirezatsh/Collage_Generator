"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redisConfig_1 = __importDefault(require("../config/redisConfig"));
const processCollageJob_1 = __importDefault(require("./processCollageJob"));
const request_1 = __importDefault(require("../models/request"));
const loggerHelper_1 = require("../utils/loggerHelper");
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const handleCollageJob = async (job) => {
    const { images, collageType, borderSize, backgroundColor, requestId } = job.data;
    console.log(`Job received: ${job.id}`);
    const startTime = new Date();
    const logStep = async (message, status) => {
        const now = new Date();
        try {
            await (0, loggerHelper_1.logRequestStatus)(requestId, 'p0Value', 'p1Value', startTime, now, status, message);
        }
        catch (err) {
            console.error(`Error while logging step: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        console.log(`🔹 [${status}] Job ${job.id}: ${message}`);
    };
    try {
        const request = await request_1.default.findById(requestId);
        if (request && request.status === 'CANCELLED') {
            await logStep('Job has been cancelled.', 'CANCELED');
            throw new Error('Job was cancelled.');
        }
        await logStep('Started collage processing...', 'PROCESSING');
        await sleep(15000);
        const updatedRequest = await request_1.default.findById(requestId);
        if (updatedRequest && updatedRequest.status === 'CANCELLED') {
            await logStep('Job was cancelled during processing.', 'CANCELED');
            throw new Error('Job was cancelled during processing.');
        }
        const { resultUrl } = await (0, processCollageJob_1.default)(images, collageType, borderSize, backgroundColor, async (msg) => {
            await logStep(msg, 'PROCESSING');
        });
        if (updatedRequest && updatedRequest.status !== 'CANCELLED') {
            updatedRequest.status = 'COMPLETED';
            updatedRequest.resultUrl = resultUrl;
            await updatedRequest.save();
        }
        await logStep('Collage processing completed successfully.', 'COMPLETED');
        return { resultUrl };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        await logStep(`Processing failed: ${errorMsg}`, 'FAILED');
        console.log(`Job ${job.id} failed! Error: ${errorMsg}`);
        throw err;
    }
};
const collageWorker = new bullmq_1.Worker('collageQueue', handleCollageJob, {
    connection: redisConfig_1.default,
    concurrency: 1,
    lockDuration: 60000,
    stalledInterval: 30000,
    maxStalledCount: 2,
});
collageWorker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed! Result: ${JSON.stringify(result)}`);
});
collageWorker.on('failed', (job, err) => {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.log(`Job ${job?.id ?? 'unknown'} failed! Error: ${errorMsg}`);
});
collageWorker.on('paused', async () => {
    console.log('Worker has been paused.');
    const pendingRequests = await request_1.default.find({ status: 'PROCESSING' });
    for (const req of pendingRequests) {
        req.status = 'CANCELLED';
        await req.save();
        console.log(`Request ${req._id} canceled due to pause.`);
    }
});
