import { useState } from "react";
import { uploadBlogPdf } from "../../api/client";
import { useAlert } from "../../context/AlertContext";

// value: {url, fileName, size} | null. onChange(value) on successful upload.
export default function PdfUploader({ value, onChange }) {
  const alert = useAlert();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadBlogPdf(file);
      onChange(result);
    } catch (err) {
      alert.error(err.message || "PDF upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-field">
      <span>PDF file</span>
      {value?.url && (
        <p className="staff-security-note" style={{ marginBottom: 8 }}>
          Current file: {value.fileName || "PDF"}{" "}
          {value.size ? `(${(value.size / (1024 * 1024)).toFixed(1)} MB)` : ""} —{" "}
          <a href={value.url} target="_blank" rel="noopener noreferrer">
            view
          </a>
        </p>
      )}
      <input type="file" accept="application/pdf" onChange={handleFile} />
      {uploading && <span className="staff-security-note">Uploading...</span>}
    </div>
  );
}
