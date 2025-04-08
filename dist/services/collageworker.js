"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redisconfig_1 = __importDefault(require("../config/redisconfig"));
const processCollageJob_1 = __importDefault(require("./processCollageJob"));
const collageWorker = new bullmq_1.Worker('collageQueue', async (job) => {
    const { images, collageType, borderSize, borderColor } = job.data;
    console.log(`Processing collage for job: ${job.id}`);
    const { resultUrl } = await (0, processCollageJob_1.default)(images, collageType, borderSize, borderColor);
    return { resultUrl };
}, {
    connection: redisconfig_1.default,
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
        console.log(`Job ${job.id} failed! Error: ${err.message}`);
    }
    else {
        console.log('Job is undefined!');
    }
});
