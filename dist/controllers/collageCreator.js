"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const createCollage = async (images, collageType, borderSize, borderColor) => {
    try {
        let collage = (0, sharp_1.default)({
            create: {
                width: collageType === 'horizontal'
                    ? 3 * 300 + borderSize * 2
                    : 300 + borderSize * 2,
                height: collageType === 'vertical'
                    ? 3 * 300 + borderSize * 2
                    : 300 + borderSize * 2,
                channels: 3,
                background: borderColor,
            },
        });
        for (let i = 0; i < images.length; i++) {
            const image = (0, sharp_1.default)(images[i]);
            collage = collage.composite([
                {
                    input: await image.resize(300).toBuffer(),
                    top: collageType === 'vertical' ? i * 300 + borderSize : borderSize,
                    left: collageType === 'horizontal' ? i * 300 + borderSize : borderSize,
                },
            ]);
        }
        const outputBuffer = await collage.toBuffer();
        return outputBuffer;
    }
    catch (error) {
        console.error('Error creating collage:', error);
        throw error;
    }
};
exports.default = createCollage;
