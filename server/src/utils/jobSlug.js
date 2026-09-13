import { customAlphabet } from "nanoid";
import Job from "../models/Job.js";

const suffixId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);

// Same approach as utils/slugify.js (Blog) — kept as a separate copy
// rather than a shared generic helper because the two models' uniqueness
// checks run against different collections, and this keeps each file
// self-contained the way the codebase already does for Blog.
function slugifyText(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function generateUniqueJobSlug(title, { excludeId } = {}) {
  const base = slugifyText(title) || "job";
  const query = (slug) => {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    return q;
  };

  const baseTaken = await Job.exists(query(base));
  if (!baseTaken) return base;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${suffixId()}`;
    // eslint-disable-next-line no-await-in-loop
    const taken = await Job.exists(query(candidate));
    if (!taken) return candidate;
  }
  throw new Error("Could not generate a unique slug — please try a different title.");
}
