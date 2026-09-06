import { customAlphabet } from "nanoid";
import Blog from "../models/Blog.js";

const suffixId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

// "How GPS Tracking Improves Logistics!" -> "how-gps-tracking-improves-logistics"
function slugifyText(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip anything that isn't alphanumeric/space/hyphen
    .replace(/\s+/g, "-") // spaces -> hyphens
    .replace(/-+/g, "-") // collapse repeated hyphens
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    .slice(0, 80);
}

// Generates a slug from a title, appending a short random suffix only
// if the plain slug is already taken — most posts end up with a clean
// "/blogs/how-gps-tracking-improves-logistics" URL, and only a genuine
// collision (e.g. two posts with an identical title) gets the "-a1b2c"
// suffix instead of silently overwriting/erroring.
export async function generateUniqueSlug(title, { excludeId } = {}) {
  const base = slugifyText(title) || "post";
  const query = (slug) => {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    return q;
  };

  const baseTaken = await Blog.exists(query(base));
  if (!baseTaken) return base;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${suffixId()}`;
    // eslint-disable-next-line no-await-in-loop
    const taken = await Blog.exists(query(candidate));
    if (!taken) return candidate;
  }
  throw new Error("Could not generate a unique slug — please try a different title.");
}
