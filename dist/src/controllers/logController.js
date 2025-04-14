"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLogs = exports.getLogsByRequestId = void 0;
const logger_1 = __importDefault(require("../models/logger"));
const getLogsByRequestId = async (req, res) => {
    const { requestId } = req.params;
    try {
        const logs = await logger_1.default.find({ request: requestId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Logs fetched successfully',
            data: logs,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res
                .status(500)
                .json({ message: 'Error fetching logs', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Unknown error while fetching logs' });
        }
    }
};
exports.getLogsByRequestId = getLogsByRequestId;
const getAllLogs = async (req, res) => {
    try {
        const logs = await logger_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: 'All logs fetched successfully',
            data: logs,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res
                .status(500)
                .json({ message: 'Error fetching logs', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Unknown error while fetching logs' });
        }
    }
};
exports.getAllLogs = getAllLogs;
