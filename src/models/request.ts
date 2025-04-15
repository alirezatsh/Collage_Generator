import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  images: string[];
  collageType: 'horizontal' | 'vertical';
  borderSize: number;
  backgroundColor: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  resultUrl?: string;
}

const RequestSchema: Schema = new Schema(
  {
    images: { type: [String], required: true },
    collageType: {
      type: String,
      enum: ['horizontal', 'vertical'],
      required: true,
    },
    borderSize: { type: Number, default: 5 },
    backgroundColor: { type: String, default: '#FFFFFF' },
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PROCESSING',
    },
    resultUrl: { type: String, default: null },
  },
  { timestamps: true }
);

const RequestModel = mongoose.model<IRequest>('Request', RequestSchema);
export default RequestModel;
