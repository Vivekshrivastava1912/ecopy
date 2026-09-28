import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extracts total pages and generates crisp image preview URLs for PDF pages
 * @param {string|ArrayBuffer} pdfSource Base64 data URL or ArrayBuffer
 * @param {number} maxPages Maximum number of page previews to generate (default 10)
 * @returns {Promise<{ totalPages: number, pagePreviews: string[] }>}
 */
export async function renderPdfPreviews(pdfSource, maxPages = 10) {
  try {
    let loadingTask;
    if (typeof pdfSource === 'string' && pdfSource.startsWith('data:')) {
      const base64Data = pdfSource.split(',')[1];
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      loadingTask = pdfjsLib.getDocument({ data: bytes });
    } else {
      loadingTask = pdfjsLib.getDocument(pdfSource);
    }

    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages || 1;
    const pagePreviews = [];

    const pagesToRender = Math.min(totalPages, maxPages);

    for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 }); // 1.5x crisp rendering

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      const imgDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      pagePreviews.push(imgDataUrl);
    }

    return {
      totalPages,
      pagePreviews
    };
  } catch (err) {
    console.warn('PDF.js rendering fallback notice:', err);
    return {
      totalPages: 1,
      pagePreviews: []
    };
  }
}
