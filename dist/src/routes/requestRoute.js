"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const requestController_1 = require("../controllers/requestController");
const jobStatusController_1 = require("../controllers/jobStatusController");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post('/upload', upload.array('images', 3), requestController_1.uploadImages);
router.get('/collages/:requestId', requestController_1.getCollageStatus);
router.post('/cancel/:requestId', requestController_1.cancelCollageRequest);
router.get('/collages/:jobId', jobStatusController_1.getJobStatus);
router.get('/collages', requestController_1.getAllRequests);
exports.default = router;
