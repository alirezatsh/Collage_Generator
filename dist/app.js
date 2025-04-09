"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodbConfig_1 = __importDefault(require("./src/config/mongodbConfig"));
const requestRoute_1 = __importDefault(require("./src/routes/requestRoute"));
require("./src/queue/collageWorker");
const deleteOldFiles_1 = require("./src/objectStorage/deleteOldFiles");
(0, deleteOldFiles_1.deleteOldFiles)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', requestRoute_1.default);
app.get('/', (req, res) => {
    res.send('Collage Generator API is running 🚀');
});
(0, mongodbConfig_1.default)();
exports.default = app;
