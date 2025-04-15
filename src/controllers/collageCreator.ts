/* eslint-disable no-undef */
/* eslint-disable no-useless-catch */
import sharp from 'sharp';
import axios from 'axios';

const createCollage = async (
  images: string[],
  collageType: 'horizontal' | 'vertical',
  borderSize: number,
  backgroundColor: string
): Promise<Buffer> => {
  try {
    const imageSize = 300;

    const width =
      collageType === 'horizontal'
        ? borderSize + images.length * (imageSize + borderSize)
        : imageSize + 2 * borderSize;

    const height =
      collageType === 'vertical'
        ? borderSize + images.length * (imageSize + borderSize)
        : imageSize + 2 * borderSize;

    const backgroundBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: backgroundColor,
      },
    })
      .png()
      .toBuffer();

    const compositeImages = await Promise.all(
      images.map(async (img, index) => {
        const originalBuffer = await axios
          .get(img, { responseType: 'arraybuffer' })
          .then((res) => Buffer.from(res.data));

        const resizedBuffer = await sharp(originalBuffer)
          .resize(imageSize, imageSize)
          .toBuffer();

        const top =
          collageType === 'vertical'
            ? borderSize + index * (imageSize + borderSize)
            : borderSize;

        const left =
          collageType === 'horizontal'
            ? borderSize + index * (imageSize + borderSize)
            : borderSize;

        return {
          input: resizedBuffer,
          top,
          left,
        };
      })
    );

    const finalCollage = await sharp(backgroundBuffer)
      .composite(compositeImages)
      .jpeg()
      .toBuffer();

    return finalCollage;
  } catch (error) {
    throw error;
  }
};

export default createCollage;
