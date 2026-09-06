import Blog from "../models/Blog.js";

// ---------------------------------------------------------------------------
// Single source of truth for "promote any scheduled post whose time has
// come" — used by BOTH the background scheduler (utils/blogScheduler.js,
// runs independently of any visitor) and the pre-existing lazy-promotion
// calls in blogController.js's public routes.
//
// The actual mutation is a single atomic MongoDB updateMany() filtered
// on `status: "scheduled", scheduledFor: { $lte: now }`. That filter is
// what makes this naturally idempotent and safe to call concurrently or
// repeatedly:
//   - A post only matches while it's still "scheduled". The moment a
//     given document is promoted, its status flips to "published" and
//     it will never match this filter again — so a second/overlapping
//     call simply finds nothing left to do for it.
//   - MongoDB applies each matched document's update atomically, so two
//     near-simultaneous callers can't both "half apply" a change to the
//     same document or double-publish it.
// ---------------------------------------------------------------------------
export async function promoteDueScheduledPosts() {
  const now = new Date();
  const filter = { status: "scheduled", scheduledFor: { $lte: now } };

  // A find() purely for a useful log line below — it plays no part in
  // the actual state change.
  const due = await Blog.find(filter)
    .select("_id title slug")
    .lean();

  const result = await Blog.updateMany(
    filter,
    [
      {
        $set: {
          status: "published",
          publishedAt: "$scheduledFor",
          scheduledFor: null,
        },
      },
    ],
    { updatePipeline: true }
  );

  if (due.length > 0) {
    console.log(
      `[blog-publication] Promoted ${due.length} scheduled post(s) to published: ` +
        due.map((b) => `"${b.title}" (${b.slug})`).join(", ")
    );
  }

  return result;
}