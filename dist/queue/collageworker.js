"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
const request_1 = __importDefault(require("../models/request"));
const collageWorker = new bullmq_1.Worker('collageQueue', async (job) => {
    const { requestId } = job.data;
    const request = await request_1.default.findById(requestId);
    if (!request)
        throw new Error('Request not found');
    await request_1.default.findByIdAndUpdate(requestId, { status: 'PROCESSING' });
    try {
        const resultUrl = `https://your-domain.com/output/${requestId}.jpg`;
        await request_1.default.findByIdAndUpdate(requestId, {
            status: 'COMPLETED',
            resultUrl,
        });
    }
    catch (err) {
        await request_1.default.findByIdAndUpdate(requestId, { status: 'FAILED' });
    }
}, { connection: connection_1.connection });
exports.default = collageWorker;
