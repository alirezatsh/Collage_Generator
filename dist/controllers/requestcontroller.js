"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobStatus = void 0;
const bullmq_1 = require("bullmq");
const redisconfig_1 = __importDefault(require("../config/redisconfig"));
const collageQueue = new bullmq_1.Queue('collageQueue', {
    connection: redisconfig_1.default,
});
const getJobStatus = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await collageQueue.getJob(jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        res.status(200).json({
            jobId: job.id,
            status: job.finishedOn
                ? 'COMPLETED'
                : job.isFailed()
                    ? 'FAILED'
                    : 'PROCESSING',
            resultUrl: job.finishedOn ? job.returnvalue?.resultUrl : null,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching job status',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getJobStatus = getJobStatus;
