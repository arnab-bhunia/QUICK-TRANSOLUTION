import ImageUploader from "./ImageUploader";

// value: { metaTitle, metaDescription, ogImage, ogImageKey, canonicalUrl }
export default function SeoFields({ value, onChange, defaultTitle }) {
  const update = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="staff-create-grid">
      <label className="admin-field">
        <span>SEO title ({(value.metaTitle || "").length}/70)</span>
        <input
          maxLength={70}
          placeholder={defaultTitle}
          value={value.metaTitle || ""}
          onChange={update("metaTitle")}
        />
      </label>
      <label className="admin-field">
        <span>Canonical URL (optional)</span>
        <input value={value.canonicalUrl || ""} onChange={update("canonicalUrl")} />
      </label>
      <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
        <span>SEO description ({(value.metaDescription || "").length}/160)</span>
        <textarea
          rows={2}
          maxLength={160}
          value={value.metaDescription || ""}
          onChange={update("metaDescription")}
        />
      </label>
      <div style={{ gridColumn: "1 / -1" }}>
        <ImageUploader
          label="Social share image (OG image) — optional, falls back to the featured image if not set"
          showAlt={false}
          value={value.ogImage ? { url: value.ogImage, key: value.ogImageKey } : null}
          onChange={(v) => onChange({ ...value, ogImage: v.url, ogImageKey: v.key })}
        />
      </div>
    </div>
  );
}
