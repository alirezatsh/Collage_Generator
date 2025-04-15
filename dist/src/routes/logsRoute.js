"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logController_1 = require("../controllers/logController");
const router = express_1.default.Router();
router.get('/logs', logController_1.getAllLogs);
router.get('/logs/:requestId', logController_1.getLogsByRequestId);
exports.default = router;
