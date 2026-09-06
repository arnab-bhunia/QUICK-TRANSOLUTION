import { uploadToCloudinary } from "../utils/storage.js";
import {
  extensionForImage,
  extensionForPdf,
  verifyImageSignature,
  verifyPdfSignature,
} from "../middleware/uploadValidation.js";

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded." });
  }

  // Magic-byte check happens BEFORE anything reaches Cloudinary — a
  // mismatched file never gets uploaded to storage in the first place, so
  // there's nothing to clean up if it's rejected.
  await verifyImageSignature(req.file.buffer);

  const extension = extensionForImage(req.file.mimetype);
  const { url, key } = await uploadToCloudinary({
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    extension,
    folder: "blog",
    resourceType: "image",
  });

  res.status(201).json({ url, key });
}

export async function uploadPdf(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded." });
  }

  await verifyPdfSignature(req.file.buffer);

  const extension = extensionForPdf(req.file.mimetype);
  const { url, key } = await uploadToCloudinary({
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    extension,
    folder: "blog-pdf",
    resourceType: "raw", // Cloudinary treats non-image/video files as "raw"
  });

  res.status(201).json({
    url,
    key,
    fileName: req.file.originalname,
    size: req.file.size,
  });
}