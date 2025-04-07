"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redisconfig_1 = __importDefault(require("../config/redisconfig"));
const collageQueue = new bullmq_1.Queue('collageQueue', {
    connection: redisconfig_1.default,
});
exports.default = collageQueue;
