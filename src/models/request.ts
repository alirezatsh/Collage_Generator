import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  images: string[];
  collageType: 'horizontal' | 'vertical';
  borderSize: number;
  borderColor: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  resultUrl?: string;
  createdAt: Date;
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
    borderColor: { type: String, default: '#FFFFFF' },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    resultUrl: { type: String },
  },
  { timestamps: true }
);

const RequestModel = mongoose.model('Request', RequestSchema);
export default RequestModel;
