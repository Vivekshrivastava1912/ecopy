import express from 'express';
import PrintJob from '../models/PrintJob.js';

const router = express.Router();

// @route   POST /api/print/upload-check
// @desc    Validate file before processing
router.post('/upload-check', (req, res) => {
  const { fileName, fileSizeMB } = req.body;

  if (fileSizeMB > 25) {
    return res.status(400).json({
      success: false,
      errorCode: 'FILE_TOO_LARGE',
      message: `File size exceeds limit (${fileSizeMB.toFixed(1)}MB > 25MB). Please compress file before uploading.`
    });
  }

  const allowedExtensions = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'txt'];
  const ext = fileName?.split('.').pop().toLowerCase();
  if (fileName && !allowedExtensions.includes(ext)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_FORMAT',
      message: `Format .${ext} is not supported. Supported: PDF, DOCX, PNG, JPG, WEBP, SVG.`
    });
  }

  res.json({
    success: true,
    message: 'File upload validated successfully.'
  });
});

// @route   POST /api/print/create-job
// @desc    Save uploaded document and print job configuration into MongoDB upon payment
router.post('/create-job', async (req, res) => {
  try {
    const { 
      kioskId = 'EX-MAIN', 
      fileName, 
      fileSizeMB = 1, 
      fileType = 'pdf', 
      totalPages = 1, 
      pageRange = 'All', 
      pagesToPrintCount = 1, 
      isColor = false, 
      rotation = 0,
      filterMode = 'normal',
      isDuplex = false, 
      copies = 1,
      totalCost = 2.0,
      paymentMethod = 'UPI',
      filePreviewData = ''
    } = req.body;

    const jobId = 'JOB-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const newJob = new PrintJob({
      jobId,
      kioskId,
      fileName: fileName || 'Uploaded_Document.pdf',
      fileSizeMB: Number(fileSizeMB) || 1,
      fileType,
      totalPages: Number(totalPages) || 1,
      pageRange: pageRange || '1-' + totalPages,
      pagesToPrintCount: Number(pagesToPrintCount) || 1,
      isColor: Boolean(isColor),
      rotation: Number(rotation) || 0,
      filterMode: filterMode || 'normal',
      isDuplex: Boolean(isDuplex),
      copies: Number(copies) || 1,
      totalCost: Number(totalCost) || 2.0,
      status: 'COMPLETED',
      queuePosition: 1,
      paymentStatus: 'SUCCESS',
      paymentMethod,
      transactionId,
      filePreviewData: filePreviewData ? filePreviewData.substring(0, 1000000) : ''
    });

    await newJob.save();
    console.log(`[Ecopy Server] Print job saved to MongoDB: ${newJob.jobId} (${newJob.fileName})`);

    res.json({
      success: true,
      message: 'Print job data successfully saved to MongoDB database.',
      job: newJob
    });
  } catch (err) {
    console.error('[Ecopy Server Error] create-job failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/print/job/:jobId
// @desc    Permanently delete the document record from MongoDB when user confirms "YES" (Print Received)
router.delete('/job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  try {
    const deletedJob = await PrintJob.findOneAndDelete({ jobId });
    console.log(`[Ecopy Server] Confirmed receipt. Document permanently deleted from MongoDB: ${jobId}`);

    res.json({
      success: true,
      jobId,
      deleted: !!deletedJob,
      message: 'Document record and data successfully purged and deleted from MongoDB database for zero-trace privacy.'
    });
  } catch (err) {
    console.error('[Ecopy Server Error] delete-job failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/print/report-failed
// @desc    Mark print job as failed / issue reported when user clicks "NO" (Print Not Received)
router.post('/report-failed', async (req, res) => {
  const { jobId, reason = 'User reported printout not received' } = req.body;
  try {
    const job = await PrintJob.findOne({ jobId });
    if (job) {
      job.status = 'FAILED_TEST_CASE';
      job.paymentStatus = 'REFUNDED';
      await job.save();
    }

    res.json({
      success: true,
      jobId,
      status: 'FAILED_TEST_CASE',
      message: 'Failure test case recorded. Support ticket created and refund flag activated.',
      supportWhatsapp: 'https://wa.me/919876543210?text=Printout%20Not%20Received%20Job%20' + jobId
    });
  } catch (err) {
    console.error('[Ecopy Server Error] report-failed failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/print/jobs
// @desc    Get all print jobs from MongoDB
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await PrintJob.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

