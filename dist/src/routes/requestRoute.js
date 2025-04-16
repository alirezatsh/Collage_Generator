"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const requestController_1 = require("../controllers/requestController");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post('/requests/upload', upload.array('images', 3), requestController_1.uploadImages);
router.get('/requests', requestController_1.getAllRequests);
router.get('/requests/:requestId', requestController_1.getCollageStatus);
router.post('/requests/cancel/:requestId/', requestController_1.cancelCollageRequest);
exports.default = router;
