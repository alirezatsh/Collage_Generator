"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collageQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
exports.collageQueue = new bullmq_1.Queue('collageQueue', {
    connection: connection_1.connection,
});
