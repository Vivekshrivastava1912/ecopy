import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  kioskId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSizeMB: { type: Number, required: true },
  fileType: { type: String, required: true },
  totalPages: { type: Number, required: true },
  pageRange: { type: String, default: 'All' },
  pagesToPrintCount: { type: Number, required: true },
  isColor: { type: Boolean, default: false },
  isDuplex: { type: Boolean, default: false },
  copies: { type: Number, default: 1 },
  totalCost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['QUEUED', 'PROCESSING', 'PRINTING', 'COMPLETED', 'FAILED_PAPER_JAM', 'SHREDDED_DELETED'], 
    default: 'QUEUED' 
  },
  queuePosition: { type: Number, default: 1 },
  isPasswordProtected: { type: Boolean, default: false },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  transactionId: { type: String },
  shreddedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.PrintJob || mongoose.model('PrintJob', printJobSchema);
