"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const axios_1 = __importDefault(require("axios"));
const createCollage = async (images, collageType, borderSize, backgroundColor) => {
    try {
        const imageSize = 300;
        const width = collageType === 'horizontal'
            ? borderSize + images.length * (imageSize + borderSize)
            : imageSize + 2 * borderSize;
        const height = collageType === 'vertical'
            ? borderSize + images.length * (imageSize + borderSize)
            : imageSize + 2 * borderSize;
        const backgroundBuffer = await (0, sharp_1.default)({
            create: {
                width,
                height,
                channels: 4,
                background: backgroundColor,
            },
        })
            .png()
            .toBuffer();
        const compositeImages = await Promise.all(images.map(async (img, index) => {
            const originalBuffer = await axios_1.default
                .get(img, { responseType: 'arraybuffer' })
                .then((res) => Buffer.from(res.data));
            const resizedBuffer = await (0, sharp_1.default)(originalBuffer)
                .resize(imageSize, imageSize)
                .toBuffer();
            const top = collageType === 'vertical'
                ? borderSize + index * (imageSize + borderSize)
                : borderSize;
            const left = collageType === 'horizontal'
                ? borderSize + index * (imageSize + borderSize)
                : borderSize;
            return {
                input: resizedBuffer,
                top,
                left,
            };
        }));
        const finalCollage = await (0, sharp_1.default)(backgroundBuffer)
            .composite(compositeImages)
            .jpeg()
            .toBuffer();
        return finalCollage;
    }
    catch (error) {
        console.error('Error creating collage:', error);
        throw error;
    }
};
exports.default = createCollage;
