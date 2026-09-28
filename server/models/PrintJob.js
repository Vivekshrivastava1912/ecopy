import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  kioskId: { type: String, default: 'EX-MAIN' },
  fileName: { type: String, required: true },
  fileSizeMB: { type: Number, default: 0 },
  fileType: { type: String, default: 'pdf' },
  totalPages: { type: Number, default: 1 },
  pageRange: { type: String, default: 'All' },
  pagesToPrintCount: { type: Number, default: 1 },
  isColor: { type: Boolean, default: false },
  rotation: { type: Number, default: 0 },
  filterMode: { type: String, default: 'normal' },
  isDuplex: { type: Boolean, default: false },
  copies: { type: Number, default: 1 },
  totalCost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: [
      'QUEUED', 
      'PROCESSING', 
      'PRINTING', 
      'COMPLETED', 
      'COLLECTED_PURGED', 
      'TIMEOUT_PURGED', 
      'FAILED_TEST_CASE', 
      'FAILED_PAPER_JAM', 
      'SHREDDED_DELETED'
    ], 
    default: 'QUEUED' 
  },
  queuePosition: { type: Number, default: 1 },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'SUCCESS'
  },
  paymentMethod: { type: String, default: 'UPI' },
  transactionId: { type: String },
  // Cloudinary storage fields
  cloudinaryUrl: { type: String, default: '' },
  cloudinaryPublicId: { type: String, default: '' },
  cloudinaryPublicIds: [{ type: String }],
  cloudinaryResourceType: { type: String, default: 'image' },
  // User data purge & lifecycle tracking
  isFilePurged: { type: Boolean, default: false },
  purgedAt: { type: Date },
  feedbackStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED_RECEIVED', 'NOT_RECEIVED', 'TIMEOUT_NO_ACTION'],
    default: 'PENDING'
  },
  filePreviewData: { type: String, default: '' }, // Cleared when purged
  shreddedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.PrintJob || mongoose.model('PrintJob', printJobSchema);
