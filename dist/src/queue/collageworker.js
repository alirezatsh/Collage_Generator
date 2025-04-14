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
const collageWorker = new bullmq_1.Worker('collageQueue', async (job) => {
    const { images, collageType, borderSize, backgroundColor, requestId } = job.data;
    console.log(`Processing collage for job: ${job.id}`);
    const startTime = new Date();
    try {
        const { resultUrl } = await (0, processCollageJob_1.default)(images, collageType, borderSize, backgroundColor, async (msg) => {
            console.log(msg);
        });
        const request = await request_1.default.findById(requestId);
        if (request) {
            request.status = 'COMPLETED';
            request.resultUrl = resultUrl;
            await request.save();
        }
        const endTime = new Date();
        await (0, loggerHelper_1.logRequestStatus)(requestId, 'p0Value', 'p1Value', startTime, endTime, 'COMPLETED', 'Collage processing completed successfully.');
        return { resultUrl };
    }
    catch (err) {
        const endTime = new Date();
        await (0, loggerHelper_1.logRequestStatus)(requestId, 'p0Value', 'p1Value', startTime, endTime, 'FAILED', `Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.log(`Job ${job.id} failed! Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        throw err;
    }
}, {
    connection: redisConfig_1.default,
});
collageWorker.on('completed', (job, result) => {
    if (job) {
        console.log(`Job ${job.id} completed! Result: ${JSON.stringify(result)}`);
    }
    else {
        console.log('Job is undefined!');
    }
});
collageWorker.on('failed', (job, err) => {
    if (job) {
        if (err instanceof Error) {
            console.log(`Job ${job.id} failed! Error: ${err.message}`);
        }
        else {
            console.log('Job failed with an unknown error!');
        }
    }
    else {
        console.log('Job is undefined!');
    }
});
