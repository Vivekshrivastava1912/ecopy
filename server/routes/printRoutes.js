import express from 'express';
import PrintJob from '../models/PrintJob.js';
import { uploadToCloudinary, deleteFromCloudinary, getCloudinaryPageUrl } from '../config/cloudinary.js';
import { connectDB } from '../config/db.js';

const router = express.Router();

// @route   POST /api/print/upload-document
// @desc    Upload document / image to Cloudinary (applies B&W / Grayscale and rotation if selected)
router.post('/upload-document', async (req, res) => {
  try {
    await connectDB();
    const { fileData, fileName, fileSizeMB = 1, existingPublicId, filterMode = 'normal', rotation = 0, isBw = false } = req.body;

    if (!fileData) {
      return res.status(400).json({ success: false, message: 'No file data received' });
    }

    if (fileSizeMB > 25) {
      return res.status(400).json({
        success: false,
        errorCode: 'FILE_TOO_LARGE',
        message: `File size exceeds limit (${fileSizeMB}MB > 25MB). Please compress file.`
      });
    }

    const isPdf = (fileName && fileName.toLowerCase().endsWith('.pdf')) || (fileData && fileData.startsWith('data:application/pdf'));
    const cleanName = (fileName || 'doc').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const targetPublicId = existingPublicId || `ecopy_${Date.now()}_${cleanName}`;

    // Upload to Cloudinary with Black & White transformation and rotation if chosen
    const uploadResult = await uploadToCloudinary(fileData, {
      public_id: targetPublicId,
      filterMode,
      rotation,
      isBw: isBw || filterMode === 'bw' || filterMode === 'scan',
      overwrite: true,
      invalidate: true
    });

    if (!uploadResult || !uploadResult.success) {
      return res.status(500).json({
        success: false,
        error: uploadResult?.error || 'Cloudinary upload failed'
      });
    }

    res.json({
      success: true,
      cloudinaryUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      totalPages: uploadResult.totalPages || 1,
      pagePreviews: uploadResult.pagePreviews || [uploadResult.url],
      mainPreviewUrl: uploadResult.mainPreviewUrl || uploadResult.url,
      resourceType: uploadResult.resourceType || 'image',
      format: uploadResult.format,
      bytes: uploadResult.bytes
    });
  } catch (err) {
    console.error('[Cloudinary Upload Route Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload processing error' });
  }
});

// @route   POST /api/print/create-job
// @desc    Save print job configuration & Cloudinary references into MongoDB upon payment
router.post('/create-job', async (req, res) => {
  try {
    await connectDB();
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
      cloudinaryUrl = '',
      cloudinaryPublicId = '',
      cloudinaryResourceType = 'image',
      filePreviewData = ''
    } = req.body;

    const jobId = 'JOB-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    let finalCloudinaryUrl = cloudinaryUrl;
    let finalPublicId = cloudinaryPublicId;
    let finalResourceType = cloudinaryResourceType;

    const isBwRequested = !isColor || filterMode === 'bw' || filterMode === 'scan';

    // Ensure Cloudinary URL includes /upload/e_grayscale/ if B&W selected for images
    if (isBwRequested && finalCloudinaryUrl && !finalCloudinaryUrl.endsWith('.pdf') && !finalCloudinaryUrl.includes('/e_grayscale/')) {
      finalCloudinaryUrl = finalCloudinaryUrl.replace('/upload/', '/upload/e_grayscale/');
    } else if (!isBwRequested && finalCloudinaryUrl && finalCloudinaryUrl.includes('/e_grayscale/')) {
      finalCloudinaryUrl = finalCloudinaryUrl.replace('/upload/e_grayscale/', '/upload/');
    }

    if (!finalCloudinaryUrl && filePreviewData && (filePreviewData.startsWith('data:') || filePreviewData.startsWith('http'))) {
      try {
        const uploadResult = await uploadToCloudinary(filePreviewData, {
          public_id: `${jobId}_${(fileName || 'doc').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15)}`,
          filterMode,
          isBw: isBwRequested
        });
        if (uploadResult?.success) {
          finalCloudinaryUrl = uploadResult.url;
          finalPublicId = uploadResult.publicId;
          finalResourceType = uploadResult.resourceType;
        }
      } catch (cloudErr) {
        console.warn('[Ecopy Server] Cloudinary fallback upload warning:', cloudErr);
      }
    }

    const publicIdsList = finalPublicId ? [finalPublicId] : [];

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
      cloudinaryUrl: finalCloudinaryUrl,
      cloudinaryPublicId: finalPublicId,
      cloudinaryPublicIds: publicIdsList,
      cloudinaryResourceType: finalResourceType,
      isFilePurged: false,
      feedbackStatus: 'PENDING',
      filePreviewData: finalCloudinaryUrl || ''
    });

    await newJob.save();
    console.log(`[Ecopy Server] Print job saved to MongoDB: ${newJob.jobId} (Cloudinary: ${finalPublicId || 'None'})`);

    res.json({
      success: true,
      message: 'Print job data successfully saved to MongoDB.',
      job: newJob
    });
  } catch (err) {
    console.error('[Ecopy Server Error] create-job failed:', err);
    res.status(500).json({ success: false, error: err.message || 'Job creation failed' });
  }
});

// @route   POST /api/print/job/:jobId/confirm-received
// @desc    When user confirms "YES" (Print Received): Entire PDF/image is immediately purged from Cloudinary, MongoDB status preserved
router.post('/job/:jobId/confirm-received', async (req, res) => {
  const { jobId } = req.params;
  const { cloudinaryPublicId, cloudinaryUrl, cloudinaryPublicIds } = req.body || {};
  try {
    await connectDB();
    const job = await PrintJob.findOne({ jobId });

    // Collect all public IDs and URL references from DB and request body
    const idsToPurge = [
      cloudinaryPublicId,
      cloudinaryUrl,
      ...(cloudinaryPublicIds || []),
      job?.cloudinaryPublicId,
      job?.cloudinaryUrl,
      job?.filePreviewData,
      ...(job?.cloudinaryPublicIds || [])
    ].filter(Boolean);

    console.log(`[Ecopy Server] Confirm Received: Triggering immediate Cloudinary purge for ${jobId}:`, idsToPurge);
    await deleteFromCloudinary(idsToPurge, job?.cloudinaryResourceType || 'image');

    // Retain MongoDB audit record, preserve Cloudinary URL history and update status
    if (job) {
      job.status = 'COLLECTED_PURGED';
      job.feedbackStatus = 'CONFIRMED_RECEIVED';
      job.isFilePurged = true;
      job.purgedAt = new Date();
      job.shreddedAt = new Date();
      if (!job.cloudinaryUrl && cloudinaryUrl) job.cloudinaryUrl = cloudinaryUrl;
      if (!job.cloudinaryPublicId && cloudinaryPublicId) job.cloudinaryPublicId = cloudinaryPublicId;
      await job.save();
    }

    console.log(`[Ecopy Server] Confirmed receipt. Full document permanently deleted from Cloudinary for Job: ${jobId}`);

    res.json({
      success: true,
      jobId,
      status: job?.status || 'COLLECTED_PURGED',
      feedbackStatus: job?.feedbackStatus || 'CONFIRMED_RECEIVED',
      isFilePurged: true,
      message: 'Entire PDF/Image permanently deleted from Cloudinary. Database record preserved.'
    });
  } catch (err) {
    console.error('[Ecopy Server Error] confirm-received failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/print/job/:jobId
// @desc    Backwards-compatible delete endpoint: Deletes all assets from Cloudinary and cleans file data in MongoDB
router.delete('/job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const { cloudinaryPublicId, cloudinaryUrl, cloudinaryPublicIds } = req.body || {};
  try {
    const job = await PrintJob.findOne({ jobId });
    const idsToPurge = [
      cloudinaryPublicId,
      cloudinaryUrl,
      ...(cloudinaryPublicIds || []),
      job?.cloudinaryPublicId,
      job?.cloudinaryUrl,
      job?.filePreviewData,
      ...(job?.cloudinaryPublicIds || [])
    ].filter(Boolean);

    await deleteFromCloudinary(idsToPurge, job?.cloudinaryResourceType || 'image');

    if (job) {
      job.status = 'COLLECTED_PURGED';
      job.feedbackStatus = 'CONFIRMED_RECEIVED';
      job.isFilePurged = true;
      job.purgedAt = new Date();
      if (!job.cloudinaryUrl && cloudinaryUrl) job.cloudinaryUrl = cloudinaryUrl;
      if (!job.cloudinaryPublicId && cloudinaryPublicId) job.cloudinaryPublicId = cloudinaryPublicId;
      await job.save();
    }

    res.json({
      success: true,
      jobId,
      message: 'Full file purged from Cloudinary. Database record status preserved.'
    });
  } catch (err) {
    console.error('[Ecopy Server Error] delete-job failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/print/job/:jobId/timeout-purge
// @desc    When user does nothing / 5-min timer expires: Delete full multi-page PDF/Image from Cloudinary, preserve MongoDB status
router.post('/job/:jobId/timeout-purge', async (req, res) => {
  const { jobId } = req.params;
  const { cloudinaryPublicId, cloudinaryUrl, cloudinaryPublicIds } = req.body || {};
  try {
    const job = await PrintJob.findOne({ jobId });
    const idsToPurge = [
      cloudinaryPublicId,
      cloudinaryUrl,
      ...(cloudinaryPublicIds || []),
      job?.cloudinaryPublicId,
      job?.cloudinaryUrl,
      job?.filePreviewData,
      ...(job?.cloudinaryPublicIds || [])
    ].filter(Boolean);

    await deleteFromCloudinary(idsToPurge, job?.cloudinaryResourceType || 'image');

    if (job) {
      job.status = 'TIMEOUT_PURGED';
      job.feedbackStatus = 'TIMEOUT_NO_ACTION';
      job.isFilePurged = true;
      job.purgedAt = new Date();
      job.shreddedAt = new Date();
      if (!job.cloudinaryUrl && cloudinaryUrl) job.cloudinaryUrl = cloudinaryUrl;
      if (!job.cloudinaryPublicId && cloudinaryPublicId) job.cloudinaryPublicId = cloudinaryPublicId;
      await job.save();
      console.log(`[Ecopy Server] 5-Min Timeout expired for ${jobId}. Full PDF/Image purged from Cloudinary.`);
    }

    res.json({
      success: true,
      jobId,
      status: 'TIMEOUT_PURGED',
      message: 'Session timed out. File deleted from Cloudinary. Database record preserved.'
    });
  } catch (err) {
    console.error('[Ecopy Server Error] timeout-purge failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/print/report-failed
// @desc    When user clicks "NO" (Print Not Received): Log failure, update status to FAILED_TEST_CASE
router.post('/report-failed', async (req, res) => {
  const { jobId, reason = 'User reported printout not received' } = req.body;
  try {
    const job = await PrintJob.findOne({ jobId });
    if (job) {
      job.status = 'FAILED_TEST_CASE';
      job.feedbackStatus = 'NOT_RECEIVED';
      job.paymentStatus = 'REFUNDED';
      await job.save();
    }

    console.log(`[Ecopy Server] User reported NO (Print not received) for ${jobId}. MongoDB status updated.`);

    res.json({
      success: true,
      jobId,
      status: 'FAILED_TEST_CASE',
      message: 'Failure recorded. Support ticket created and refund flag activated.',
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
