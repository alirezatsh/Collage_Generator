/* eslint-disable @typescript-eslint/no-unused-vars */
import createCollage from '../controllers/collageCreator';
import generateDownloadLink from '../objectStorage/getdownloadlink';
import { randomUUID } from 'crypto';
import uploadFileToLiara from '../objectStorage/uploadCollageToS3';

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

  await uploadFileToLiara(collageBuffer, filename);
  const url = await generateDownloadLink(filename);

  return { resultUrl: url };
};

export default processCollageJob;
