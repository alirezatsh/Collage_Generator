"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodbConfig_1 = __importDefault(require("./src/config/mongodbConfig"));
const requestRoute_1 = __importDefault(require("./src/routes/requestRoute"));
require("./src/queue/collageWorker");
const node_cron_1 = __importDefault(require("node-cron"));
const deleteOldFiles_1 = require("./src/objectStorage/deleteOldFiles");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', requestRoute_1.default);
app.get('/', (req, res) => {
    res.send('Collage Generator API is running 🚀');
});
(0, mongodbConfig_1.default)();
node_cron_1.default.schedule('* * * * *', async () => {
    console.log('Running task to delete old files...');
    await (0, deleteOldFiles_1.deleteOldFiles)();
});
exports.default = app;
