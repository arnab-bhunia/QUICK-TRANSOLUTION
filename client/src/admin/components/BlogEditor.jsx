import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { uploadBlogImage } from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import { isSafeUrl, sanitizeUrl } from "../../utils/safeUrl";
import "./BlogEditor.css";

// content: Tiptap JSON document (or null for a new post).
// onChange(json): called with editor.getJSON() on every edit.
export default function BlogEditor({ content, onChange }) {
  const alert = useAlert();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      // #43: restrict what the Link extension will accept at all —
      // covers typed/pasted autolinks, not just the toolbar "Link"
      // button below (see setLink / isSafeUrl for that path).
      Link.configure({
        openOnClick: false,
        protocols: ["http", "https", "mailto"],
        validate: (href) => isSafeUrl(href),
      }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || "",
    onUpdate: ({ editor: e }) => onChange(e.getJSON()),
  });

  if (!editor) return null;

  const insertImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { url } = await uploadBlogImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert.error(err.message || "Image upload failed.");
    }
  };

  const setLink = () => {
    const url = window.prompt("Link URL");
    if (url === null) return; // cancelled
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    // #43: reject unsafe protocols (javascript:, data:, vbscript:, ...)
    // right here at input time, before it ever reaches stored Tiptap
    // JSON — in addition to the Link extension's own `validate` above,
    // which covers typed/pasted autolinks this manual flow bypasses.
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) {
      alert.error("That link's URL type isn't allowed. Use an http(s) or mailto link.");
      return;
    }
    editor.chain().focus().setLink({ href: safeUrl }).run();
  };

  const Btn = ({ active, onClick, children, title }) => (
    <button
      type="button"
      className={`blog-editor-btn ${active ? "is-active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="blog-editor">
      <div className="blog-editor-toolbar">
        <Btn
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </Btn>
        <Btn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Btn>
        <Btn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Btn>
        <span className="blog-editor-divider" />
        <Btn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </Btn>
        <Btn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </Btn>
        <Btn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span style={{ textDecoration: "underline" }}>U</span>
        </Btn>
        <span className="blog-editor-divider" />
        <Btn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </Btn>
        <Btn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </Btn>
        <Btn
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;Quote&rdquo;
        </Btn>
        <span className="blog-editor-divider" />
        <Btn title="Link" active={editor.isActive("link")} onClick={setLink}>
          Link
        </Btn>
        <label className="blog-editor-btn" title="Insert image">
          Image
          <input type="file" accept="image/*" onChange={insertImage} style={{ display: "none" }} />
        </label>
        <Btn
          title="Table"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          Table
        </Btn>
        <Btn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          &mdash;
        </Btn>
        <span className="blog-editor-divider" />
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          &larr;
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          &rarr;
        </Btn>
      </div>
      <EditorContent editor={editor} className="blog-editor-content" />
    </div>
  );
}
