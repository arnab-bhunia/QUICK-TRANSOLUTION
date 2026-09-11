import { useEffect } from "react";

// ============================================================================
// CLIENT-SIDE SEO
// Sets document.title and the standard meta tags on mount. Worth being
// upfront about a real limitation here: this is a plain Vite SPA with no
// server-side rendering, so these tags only exist AFTER React runs in
// the browser. Modern Googlebot does execute JavaScript and generally
// picks these up, but some crawlers/social-media link previewers (which
// often don't run JS) will only ever see the tags from index.html, not
// these per-page ones. If perfect social-preview cards or maximum SEO
// robustness become a priority later, the real fix is server-side
// rendering or prerendering (e.g. vite-plugin-ssr, or a small
// prerender step at build time for known blog slugs) — a bigger
// architectural change than fits in this pass, flagged honestly rather
// than silently treated as solved.
// ============================================================================

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// Social crawlers (Facebook/LinkedIn/Twitter) require an absolute
// og:image URL — a site-relative path like "/services-banner-1.webp"
// won't resolve for them. Callers that already pass a full URL (e.g.
// a CMS-hosted blog image) are left untouched.
function toAbsoluteUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).toString();
}

export function useSeo({
  title,
  description,
  image,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogType = "article",
}) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    setMeta("description", description);
    setMeta("og:title", ogTitle || title, "property");
    setMeta("og:description", ogDescription || description, "property");
    setMeta("og:image", toAbsoluteUrl(image), "property");
    setMeta("og:type", ogType, "property");

    // Always look for an existing tag first — never create a second one
    // if this effect re-runs (e.g. navigating between two blog posts
    // without the component unmounting).
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonicalUrl);
    } else if (canonicalLink) {
      // This page has no canonical URL of its own — remove whatever was
      // set by a PREVIOUS page rather than leaving it active. Without
      // this, navigating from a blog post (which sets one) to a page
      // with none would incorrectly leave the old post's URL as the
      // "canonical" one for the new page.
      canonicalLink.remove();
    }

    return () => {
      document.title = previousTitle; // restore on unmount, e.g. navigating away
      // Also clear the canonical tag on unmount — the next page either
      // sets its own correct value or has none; either way, no stale
      // tag from THIS page should ever survive past it.
      const existing = document.querySelector('link[rel="canonical"]');
      if (existing) existing.remove();
    };
  }, [title, description, image, canonicalUrl, ogTitle, ogDescription, ogType]);
}
