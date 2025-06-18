"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requestRoute_1 = __importDefault(require("./src/routes/requestRoute"));
const logsRoute_1 = __importDefault(require("./src/routes/logsRoute"));
require("./src/queue/collageWorker");
const node_cron_1 = __importDefault(require("node-cron"));
const deleteOldFiles_1 = require("./src/objectStorage/deleteOldFiles");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', requestRoute_1.default, logsRoute_1.default);
app.get('/', (req, res) => {
    res.send('Collage Generator API is running');
});
node_cron_1.default.schedule('0 0 3/* * *', async () => {
    console.log('Running task to delete old files...');
    await (0, deleteOldFiles_1.deleteOldImages)();
});
exports.default = app;
