import { useState } from "react";
import { uploadBlogImage } from "../../api/client";
import { useAlert } from "../../context/AlertContext";

// value: {url, key, alt} | null. onChange({url, key, alt}) on a successful upload.
export default function ImageUploader({ value, onChange, label = "Image", showAlt = true }) {
  const alert = useAlert();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows re-selecting the same file again later
    if (!file) return;

    setUploading(true);
    try {
      const { url, key } = await uploadBlogImage(file);
      onChange({ url, key, alt: value?.alt || "" });
    } catch (err) {
      alert.error(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-field">
      <span>{label}</span>
      {value?.url && (
        <img
          src={value.url}
          alt={value.alt || ""}
          style={{
            width: "100%",
            maxHeight: 180,
            objectFit: "cover",
            borderRadius: "var(--radius-sm, 8px)",
            marginBottom: 8,
          }}
        />
      )}
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFile} />
      {uploading && <span className="staff-security-note">Uploading...</span>}
      {value?.url && showAlt && (
        <input
          type="text"
          placeholder="Alt text (for accessibility & SEO)"
          value={value.alt || ""}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
}
