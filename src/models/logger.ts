import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  request: mongoose.Schema.Types.ObjectId;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  message: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

const logSchema: Schema = new Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RequestModel',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED'],
    default: 'PENDING',
  },
  duration: {
    type: Number,
    default: null,
  },
});

logSchema.pre('save', function (next) {
  if (this.endTime && this.startTime instanceof Date) {
    const start = (this.startTime as Date).getTime();
    const end = (this.endTime as Date).getTime();
    this.duration = (end - start) / 1000;
  }
  next();
});

const Log = mongoose.model<ILog>('Log', logSchema);
export default Log;
