import { v2 as cloudinary } from "cloudinary";
import { customAlphabet } from "nanoid";

const safeId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

// "My Photo!!.jpg" -> "blog/2026/09/a1b2c3d4" — never trusts the original
// filename for the storage path (could contain path-traversal characters,
// spaces, or collide with another upload). Cloudinary's public_id has no
// extension of its own for images (it derives delivery format from the
// stored resource), but for "raw" files (PDFs) the extension must be part
// of the public_id or the delivery URL won't have one — so it's appended
// for raw uploads only (see uploadToCloudinary below).
function buildPublicId(folder) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${folder}/${yyyy}/${mm}/${safeId()}`;
}

export async function uploadToCloudinary({ buffer, mimeType, extension, folder, resourceType = "image" }) {
  ensureConfigured();

  const publicId = resourceType === "raw" ? `${buildPublicId(folder)}.${extension}` : buildPublicId(folder);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    key: result.public_id,
  };
}

export async function deleteFromCloudinary(publicId, resourceType = "image") {
  if (!publicId) return;

  ensureConfigured();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

export async function safeDeleteFromCloudinary(publicId, resourceType = "image") {
  if (!publicId) return;
  try {
    await deleteFromCloudinary(publicId, resourceType);
  } catch (err) {
    console.error(`Could not delete Cloudinary asset (public_id: ${publicId}):`, err.message);
  }
}