"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requestRoute_1 = __importDefault(require("./src/routes/requestRoute"));
const logsRoute_1 = __importDefault(require("./src/routes/logsRoute"));
require("./src/queue/collageWorker");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', requestRoute_1.default, logsRoute_1.default);
app.get('/', (req, res) => {
    res.send('Collage Generator API is running');
});
exports.default = app;
