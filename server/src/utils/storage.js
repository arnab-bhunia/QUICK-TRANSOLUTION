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

// `type` mirrors Cloudinary's own upload "delivery type":
//   "upload"  (default) — publicly accessible via the plain secure_url.
//     Used for blog images/PDFs, which are meant to be public.
//   "private" — NOT resolvable via a plain URL at all; the only way to
//     read it back is a short-lived signed URL minted on demand (see
//     getSignedFileUrl below). Used for candidate resumes (see spec
//     section 2: "Do not expose a public permanent resume URL").
export async function uploadToCloudinary({
  buffer,
  mimeType,
  extension,
  folder,
  resourceType = "image",
  type = "upload",
}) {
  ensureConfigured();

  const publicId = resourceType === "raw" ? `${buildPublicId(folder)}.${extension}` : buildPublicId(folder);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        type,
        overwrite: false,
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });

  return {
    // For a "private" upload this URL is NOT actually fetchable as-is —
    // callers that used type: "private" should ignore it and always go
    // through getSignedFileUrl instead. Still returned for parity/
    // debugging visibility, never persisted as a public resume link.
    url: result.secure_url,
    key: result.public_id,
  };
}

// Mints a short-lived, signed URL for a PRIVATE resource (e.g. a resume
// uploaded with type: "private" above). Anyone holding this URL can
// fetch the file until it expires — so it must only ever be generated
// behind an authenticated, permission-checked route (see
// jobApplicationController.js getApplicationResumeAdmin), never handed
// out to the public or stored anywhere.
export function getSignedFileUrl(publicId, { resourceType = "raw", expiresInSeconds = 300 } = {}) {
  ensureConfigured();

  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return cloudinary.utils.private_download_link(publicId, extensionFromPublicId(publicId), {
    resource_type: resourceType,
    type: "private",
    expires_at: expiresAt,
  });
}

function extensionFromPublicId(publicId) {
  const match = /\.([a-zA-Z0-9]+)$/.exec(publicId || "");
  return match ? match[1] : "pdf";
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