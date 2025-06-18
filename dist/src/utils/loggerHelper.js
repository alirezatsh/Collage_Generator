"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequestStatus = void 0;
const logger_1 = __importDefault(require("../models/logger"));
const logRequestStatus = async (requestId, startTime, endTime, status, message) => {
    const logEntry = new logger_1.default({
        request: requestId,
        status,
        message,
        startTime,
        endTime,
        duration: endTime
            ? (endTime.getTime() - startTime.getTime()) / 1000
            : undefined,
    });
    await logEntry.save();
    return logEntry;
};
exports.logRequestStatus = logRequestStatus;
