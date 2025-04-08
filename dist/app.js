"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const imageroute_1 = __importDefault(require("./routes/imageroute"));
require("../src/services/collageworker");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', imageroute_1.default);
app.get('/', (req, res) => {
    res.send('Collage Generator API is running 🚀');
});
(0, db_1.default)();
exports.default = app;
