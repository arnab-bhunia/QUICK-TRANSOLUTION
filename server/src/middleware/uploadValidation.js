import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

// ============================================================================
// UPLOAD VALIDATION
// memoryStorage: the file buffer stays in memory and goes straight to
// Cloudinary (see controllers/uploadController.js) — never written to
// this server's disk at all, so there's nothing to clean up and no
// local filesystem attack surface from an uploaded file.
//
// File-size limits are enforced here (multer rejects an oversized file
// before it's even fully received), separate from the MIME check below.
// ============================================================================

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const ALLOWED_PDF_TYPES = {
  "application/pdf": "pdf",
};

function fileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (!allowedTypes[file.mimetype]) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  };
}

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
}).single("file");

export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES },
  fileFilter: fileFilter(ALLOWED_PDF_TYPES),
}).single("file");

export function extensionForImage(mimeType) {
  return ALLOWED_IMAGE_TYPES[mimeType];
}
export function extensionForPdf(mimeType) {
  return ALLOWED_PDF_TYPES[mimeType];
}

// ---------------------------------------------------------------------
// MAGIC-BYTE / FILE-SIGNATURE VERIFICATION
// Everything above (fileFilter) only checks the Content-Type header the
// browser SENT — which is client-supplied and not proof of the actual
// file content. This checks the real bytes of the uploaded file itself
// against its claimed type, using file-type's signature database. Both
// checks run; this doesn't replace the MIME/extension/size checks
// above, it adds a second, independent one on top of them.
// ---------------------------------------------------------------------
export async function verifyFileSignature(buffer, allowedTypes) {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !allowedTypes[detected.mime]) {
    const err = new Error(
      "This file's actual content doesn't match its claimed type. Please upload a genuine file of the expected format."
    );
    err.status = 400;
    throw err;
  }
  return detected;
}

export function verifyImageSignature(buffer) {
  return verifyFileSignature(buffer, ALLOWED_IMAGE_TYPES);
}
export function verifyPdfSignature(buffer) {
  return verifyFileSignature(buffer, ALLOWED_PDF_TYPES);
}

// Multer reports validation failures (bad MIME, oversized file) via an
// error passed to the route's error-handling — this turns that into
// the same clean JSON error shape as the rest of the API instead of
// Express's default HTML error page.
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Upload failed." });
  }
  next();
}