import multer from "multer";

// Resume upload for the public "Apply" form. Deliberately a thin,
// dedicated multer instance (field name "resume", not "file") rather
// than reusing middleware/uploadValidation.js's pdfUpload directly —
// but it shares that file's actual validation building blocks
// (extensionForPdf / verifyPdfSignature / handleUploadError, all
// imported from there in jobApplicationController.js) so there is only
// ONE place that defines "what counts as a valid PDF" in this codebase.
const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10 MB — same ceiling as blog PDFs

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Resume must be a PDF file."));
    }
    cb(null, true);
  },
}).single("resume");
