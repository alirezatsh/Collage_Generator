/* eslint-disable @typescript-eslint/no-unused-vars */
import createCollage from '../controllers/collageCreator';
import generateDownloadLink from '../objectStorage/getdownloadlink';
import { randomUUID } from 'crypto';
import uploadToLiara from '../objectStorage/uploadCollageToS3';

const processCollageJob = async (
  images: string[],
  collageType: 'horizontal' | 'vertical',
  borderSize: number,
  borderColor: string
): Promise<{ resultUrl: string }> => {
  const collageBuffer = await createCollage(
    images,
    collageType,
    borderSize,
    borderColor
  );
  const filename = `${randomUUID()}.jpg`;

  await uploadToLiara(collageBuffer, filename);
  const url = await generateDownloadLink(filename);

  return { resultUrl: url };
};

export default processCollageJob;
