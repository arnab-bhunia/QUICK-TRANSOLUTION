import "./PdfBlog.css";

// Uses the browser's own built-in PDF renderer via <iframe> rather than
// a custom PDF.js-based viewer — every modern desktop browser renders
// PDFs natively this way. Mobile browsers vary more (some show a
// download prompt instead of an inline view), which is why View/
// Download links are offered alongside the embed rather than relying
// on the embed alone.
export default function PdfBlog({ pdf }) {
  if (!pdf?.url) return null;

  return (
    <div className="pdf-blog">
      <div className="pdf-blog-actions">
        <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="pdf-blog-btn pdf-blog-btn-primary">
          View PDF &rarr;
        </a>
        <a href={pdf.url} download={pdf.fileName || true} className="pdf-blog-btn">
          Download PDF
        </a>
      </div>
      <div className="pdf-blog-viewer">
        <iframe src={pdf.url} title={pdf.fileName || "PDF publication"} />
      </div>
    </div>
  );
}
