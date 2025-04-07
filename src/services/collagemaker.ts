/* eslint-disable no-undef */
import sharp from 'sharp';
import axios from 'axios';

export const createCollage = async (
  imageUrls: string[],
  collageType: 'GRID' | 'VERTICAL' | 'HORIZONTAL',
  borderSize = 10,
  borderColor = '#ffffff'
): Promise<Buffer> => {
  const images: Buffer[] = [];

  for (const url of imageUrls) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    images.push(Buffer.from(response.data));
  }

  const imageSharpList = images.map((img) =>
    sharp(img).resize(300, 300).extend({
      top: borderSize,
      bottom: borderSize,
      left: borderSize,
      right: borderSize,
      background: borderColor,
    })
  );

  const buffers = await Promise.all(
    imageSharpList.map((img) => img.toBuffer())
  );

  if (collageType === 'VERTICAL') {
    return await sharp({
      create: {
        width: 300 + 2 * borderSize,
        height: (300 + 2 * borderSize) * buffers.length,
        channels: 3,
        background: borderColor,
      },
    })
      .composite(
        buffers.map((buf, i) => ({
          input: buf,
          top: i * (300 + 2 * borderSize),
          left: 0,
        }))
      )
      .jpeg()
      .toBuffer();
  }

  if (collageType === 'HORIZONTAL') {
    return await sharp({
      create: {
        width: (300 + 2 * borderSize) * buffers.length,
        height: 300 + 2 * borderSize,
        channels: 3,
        background: borderColor,
      },
    })
      .composite(
        buffers.map((buf, i) => ({
          input: buf,
          top: 0,
          left: i * (300 + 2 * borderSize),
        }))
      )
      .jpeg()
      .toBuffer();
  }

  const columns = 2;
  const rows = Math.ceil(buffers.length / columns);

  return await sharp({
    create: {
      width: columns * (300 + 2 * borderSize),
      height: rows * (300 + 2 * borderSize),
      channels: 3,
      background: borderColor,
    },
  })
    .composite(
      buffers.map((buf, i) => ({
        input: buf,
        top: Math.floor(i / columns) * (300 + 2 * borderSize),
        left: (i % columns) * (300 + 2 * borderSize),
      }))
    )
    .jpeg()
    .toBuffer();
};
