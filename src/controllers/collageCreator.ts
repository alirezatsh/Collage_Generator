/* eslint-disable no-undef */
import sharp from 'sharp';

const createCollage = async (
  images: string[],
  collageType: 'horizontal' | 'vertical',
  borderSize: number,
  borderColor: string
) => {
  try {
    let collage = sharp({
      create: {
        width:
          collageType === 'horizontal'
            ? 3 * 300 + borderSize * 2
            : 300 + borderSize * 2,
        height:
          collageType === 'vertical'
            ? 3 * 300 + borderSize * 2
            : 300 + borderSize * 2,
        channels: 3,
        background: borderColor,
      },
    });

    for (let i = 0; i < images.length; i++) {
      const image = sharp(images[i]);
      collage = collage.composite([
        {
          input: await image.resize(300).toBuffer(),
          top: collageType === 'vertical' ? i * 300 + borderSize : borderSize,
          left:
            collageType === 'horizontal' ? i * 300 + borderSize : borderSize,
        },
      ]);
    }

    const outputBuffer = await collage.toBuffer();
    return outputBuffer; // This buffer will be used for uploading
  } catch (error) {
    console.error('Error creating collage:', error);
    throw error;
  }
};

export default createCollage;
