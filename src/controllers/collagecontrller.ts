import { Request, Response } from 'express';
import RequestModel from '../models/request';

export const createCollageRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { images, collageType, borderSize, borderColor } = req.body;
    if (!images || images.length < 2) {
      res.status(400).json({ message: 'At least two images are required' });
      return;
    }

    const newRequest = new RequestModel({
      images,
      collageType,
      borderSize,
      borderColor,
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating collage request', error });
  }
};

export const getCollageRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const requests = await RequestModel.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error });
  }
};

export const getCollageRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const request = await RequestModel.findById(id);
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request', error });
  }
};

export const deleteCollageRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const request = await RequestModel.findById(id);
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (request.status !== 'PENDING') {
      res.status(400).json({ message: 'Only PENDING requests can be deleted' });
      return;
    }

    await request.deleteOne();
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error });
  }
};
