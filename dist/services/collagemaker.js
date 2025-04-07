"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const axios_1 = __importDefault(require("axios"));
const createCollage = async (imageUrls, collageType, borderSize = 10, borderColor = '#ffffff') => {
    const images = [];
    for (const url of imageUrls) {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        images.push(Buffer.from(response.data));
    }
    const imageSharpList = images.map((img) => (0, sharp_1.default)(img).resize(300, 300).extend({
        top: borderSize,
        bottom: borderSize,
        left: borderSize,
        right: borderSize,
        background: borderColor,
    }));
    const buffers = await Promise.all(imageSharpList.map((img) => img.toBuffer()));
    if (collageType === 'VERTICAL') {
        return await (0, sharp_1.default)({
            create: {
                width: 300 + 2 * borderSize,
                height: (300 + 2 * borderSize) * buffers.length,
                channels: 3,
                background: borderColor,
            },
        })
            .composite(buffers.map((buf, i) => ({
            input: buf,
            top: i * (300 + 2 * borderSize),
            left: 0,
        })))
            .jpeg()
            .toBuffer();
    }
    if (collageType === 'HORIZONTAL') {
        return await (0, sharp_1.default)({
            create: {
                width: (300 + 2 * borderSize) * buffers.length,
                height: 300 + 2 * borderSize,
                channels: 3,
                background: borderColor,
            },
        })
            .composite(buffers.map((buf, i) => ({
            input: buf,
            top: 0,
            left: i * (300 + 2 * borderSize),
        })))
            .jpeg()
            .toBuffer();
    }
    const columns = 2;
    const rows = Math.ceil(buffers.length / columns);
    return await (0, sharp_1.default)({
        create: {
            width: columns * (300 + 2 * borderSize),
            height: rows * (300 + 2 * borderSize),
            channels: 3,
            background: borderColor,
        },
    })
        .composite(buffers.map((buf, i) => ({
        input: buf,
        top: Math.floor(i / columns) * (300 + 2 * borderSize),
        left: (i % columns) * (300 + 2 * borderSize),
    })))
        .jpeg()
        .toBuffer();
};
exports.createCollage = createCollage;
