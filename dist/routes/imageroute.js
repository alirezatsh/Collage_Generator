"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const imagecontroller_1 = require("../controllers/imagecontroller");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post('/upload', upload.array('images', 3), imagecontroller_1.uploadImages);
exports.default = router;
