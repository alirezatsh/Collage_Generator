/* eslint-disable @typescript-eslint/no-unused-vars */
import createCollage from '../controllers/collageCreator';
import generateDownloadLink from '../objectStorage/getdownloadlink';
import { randomUUID } from 'crypto';
import uploadFileToLiara from '../objectStorage/uploadCollageToS3';

// eslint-disable-next-line no-undef
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const processCollageJob = async (
  images: string[],
  collageType: 'horizontal' | 'vertical',
  borderSize: number,
  borderColor: string,
  p0: (msg: any) => Promise<void>
): Promise<{ resultUrl: string }> => {
  await sleep(15000);

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
