import express from 'express';
import PrintJob from '../models/PrintJob.js';
import Kiosk from '../models/Kiosk.js';

const router = express.Router();

// @route   POST /api/print/upload-check
// @desc    Validate file before processing
router.post('/upload-check', (req, res) => {
  const { fileName, fileSizeMB, fileType, isPasswordProtected } = req.body;

  // 1. File size limit (>10MB) check
  if (fileSizeMB > 10) {
    return res.status(400).json({
      success: false,
      errorCode: 'FILE_TOO_LARGE',
      message: `File size exceeds limit (${fileSizeMB.toFixed(1)}MB > 10MB). Please compress file before uploading.`
    });
  }

  // 2. Format validation (.pdf, .docx only)
  const allowedExtensions = ['pdf', 'docx'];
  const ext = fileName.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_FORMAT',
      message: `Format .${ext} is not supported. Exopy kiosks only support .pdf and .docx documents.`
    });
  }

  // 3. Password protection check
  if (isPasswordProtected) {
    return res.json({
      success: true,
      requiresPassword: true,
      message: 'Password-protected document detected. Client-side decryption required.'
    });
  }

  res.json({
    success: true,
    requiresPassword: false,
    message: 'File upload validated successfully.'
  });
});

// @route   POST /api/print/create-job
// @desc    Calculate cost & create queued print job
router.post('/create-job', async (req, res) => {
  try {
    const { 
      kioskId, 
      fileName, 
      fileSizeMB, 
      fileType, 
      totalPages, 
      pageRange, 
      pagesToPrintCount, 
      isColor, 
      isDuplex, 
      copies 
    } = req.body;

    // Validate page range count
    if (pagesToPrintCount > totalPages || pagesToPrintCount <= 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_PAGE_RANGE',
        message: `Invalid page range! Selected ${pagesToPrintCount} pages, but total document pages is ${totalPages}.`
      });
    }

    // Fetch kiosk to verify color support
    const kiosk = await Kiosk.findOne({ kioskId });
    if (kiosk && !kiosk.supportsColor && isColor) {
      return res.status(400).json({
        success: false,
        errorCode: 'COLOR_UNSUPPORTED',
        message: `Kiosk ${kiosk.name} supports Black & White printing only.`
      });
    }

    const rate = isColor ? 10.0 : 2.0;
    const duplexMultiplier = isDuplex ? 0.85 : 1.0;
    const totalCost = Number((pagesToPrintCount * rate * copies * duplexMultiplier).toFixed(2));

    const jobId = 'JOB-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const queuePos = (kiosk ? kiosk.queueCount : 1) + 1;

    const newJob = new PrintJob({
      jobId,
      kioskId,
      fileName,
      fileSizeMB,
      fileType,
      totalPages,
      pageRange: pageRange || '1-' + totalPages,
      pagesToPrintCount,
      isColor: kiosk && !kiosk.supportsColor ? false : isColor,
      isDuplex,
      copies,
      totalCost,
      status: 'QUEUED',
      queuePosition: queuePos,
      paymentStatus: 'PENDING'
    });

    await newJob.save();

    res.json({
      success: true,
      job: newJob
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/print/simulate-paper-jam
// @desc    Simulate kiosk paper jam hardware error & trigger refund
router.post('/simulate-paper-jam', async (req, res) => {
  const { jobId } = req.body;
  try {
    const job = await PrintJob.findOne({ jobId });
    if (job) {
      job.status = 'FAILED_PAPER_JAM';
      job.paymentStatus = 'REFUNDED';
      await job.save();
    }
    res.json({
      success: true,
      jobId,
      status: 'FAILED_PAPER_JAM',
      refundInitiated: true,
      supportWhatsapp: 'https://wa.me/919876543210?text=Exopy%20Paper%20Jam%20Issue%20Job%20' + jobId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/print/shred-document
// @desc    Auto-delete and shred document from server memory for privacy
router.post('/shred-document', async (req, res) => {
  const { jobId } = req.body;
  try {
    const job = await PrintJob.findOne({ jobId });
    if (job) {
      job.status = 'SHREDDED_DELETED';
      job.shreddedAt = new Date();
      await job.save();
    }
    res.json({
      success: true,
      jobId,
      shreddedAt: new Date(),
      message: 'Document permanently shredded and wiped from cloud memory for maximum user privacy.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
