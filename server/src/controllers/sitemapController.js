import Blog from "../models/Blog.js";

// A fixed list of the site's static pages (already-known routes that
// never change) plus every published blog slug pulled live from
// MongoDB — so publishing a new article automatically appears here on
// the very next crawl, with no manual sitemap editing ever required.
const STATIC_PATHS = ["/", "/about", "/services", "/track", "/blogs"];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function getSitemap(req, res) {
  const siteUrl = (process.env.CLIENT_ORIGIN || "http://localhost:5173").replace(/\/$/, "");

  const blogs = await Blog.find({ status: "published" })
    .select("slug updatedAt")
    .sort({ publishedAt: -1 });

  const urls = [
    ...STATIC_PATHS.map((path) => ({ loc: `${siteUrl}${path}`, lastmod: null })),
    ...blogs.map((b) => ({ loc: `${siteUrl}/blogs/${b.slug}`, lastmod: b.updatedAt })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.send(xml);
}
