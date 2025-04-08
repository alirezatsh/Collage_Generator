"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const collageCreator_1 = __importDefault(require("../controllers/collageCreator"));
const getdownloadlink_1 = __importDefault(require("../services/getdownloadlink"));
const crypto_1 = require("crypto");
const uploadCollageToS3_1 = __importDefault(require("../services/uploadCollageToS3"));
const processCollageJob = async (images, collageType, borderSize, borderColor) => {
    const collageBuffer = await (0, collageCreator_1.default)(images, collageType, borderSize, borderColor);
    const filename = `${(0, crypto_1.randomUUID)()}.jpg`;
    await (0, uploadCollageToS3_1.default)(collageBuffer, filename);
    const url = await (0, getdownloadlink_1.default)(filename);
    return { resultUrl: url };
};
exports.default = processCollageJob;
