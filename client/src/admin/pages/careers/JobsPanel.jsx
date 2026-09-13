import { useEffect, useState } from "react";
import {
  listJobsAdmin,
  getJobAdmin,
  createJobAdmin,
  updateJobAdmin,
  deleteJobAdmin,
  publishJobAdmin,
  closeJobAdmin,
  archiveJobAdmin,
  duplicateJobAdmin,
} from "../../../api/client";
import { useAlert } from "../../../context/AlertContext";
import "../StaffPanel.css";
import "../BlogManagement.css";
import "./CareersPanel.css";

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
];

const WORK_MODES = [
  { value: "on_site", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const QUESTION_TYPES = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "single_choice", label: "Single choice" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "yes_no", label: "Yes / No" },
];

const STATUS_BADGE = {
  DRAFT: "admin-badge-contacted",
  OPEN: "admin-badge-converted",
  CLOSED: "admin-badge-rejected",
  ARCHIVED: "admin-badge-on_hold",
};

const emptyForm = {
  title: "",
  department: "",
  employmentType: "full_time",
  location: "",
  workMode: "on_site",
  experience: "",
  salary: { configured: false, min: "", max: "", currency: "INR", period: "yearly", note: "" },
  shortDescription: "",
  description: "",
  responsibilitiesText: "",
  requirementsText: "",
  preferredQualificationsText: "",
  benefitsText: "",
  applicationQuestions: [],
  closingDate: "",
};

// A plain textarea, one item per line — deliberately simple rather than
// a chip/tag input: HR is writing full sentences ("Own the delivery
// pipeline end-to-end") into these fields, not short keywords, so a
// line-per-item textarea reads and edits more naturally than a tag UI.
function LinesField({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
      <span>{label} (one per line)</span>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function newQuestion(order) {
  return {
    id: `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    text: "",
    type: "short_text",
    required: false,
    options: [],
    optionsText: "",
    order,
  };
}

// The dynamic "Application Questions" builder — the frontend half of
// spec section 3. Nothing here is trusted as-is by the backend
// (jobController.js re-validates every question independently), this
// is purely the authoring UI.
function QuestionsBuilder({ questions, onChange }) {
  const update = (index, patch) => {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };
  const remove = (index) => {
    onChange(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i })));
  };
  const add = () => onChange([...questions, newQuestion(questions.length)]);
  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((q, i) => ({ ...q, order: i })));
  };

  return (
    <div className="careers-questions-builder">
      {questions.length === 0 && <p className="admin-empty">No application-specific questions yet.</p>}
      {questions.map((q, index) => (
        <div key={q.id} className="careers-question-row admin-card">
          <div className="careers-question-row-top">
            <input
              className="careers-question-text"
              placeholder="Question text"
              value={q.text}
              onChange={(e) => update(index, { text: e.target.value })}
            />
            <select value={q.type} onChange={(e) => update(index, { type: e.target.value, options: [], optionsText: "" })}>
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="careers-question-required">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => update(index, { required: e.target.checked })}
              />
              Required
            </label>
          </div>

          {(q.type === "single_choice" || q.type === "multiple_choice") && (
<input
  className="careers-question-options"
  placeholder="Options, comma separated"
  value={q.optionsText ?? ""}
  onChange={(e) => update(index, { optionsText: e.target.value })}
/>
          )}

          <div className="careers-question-row-actions">
            <button type="button" className="admin-btn" onClick={() => move(index, -1)} disabled={index === 0}>
              ↑
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => move(index, 1)}
              disabled={index === questions.length - 1}
            >
              ↓
            </button>
            <button type="button" className="admin-btn admin-btn-danger" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn" onClick={add}>
        + Add Question
      </button>
    </div>
  );
}

function linesToArray(text) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function JobsPanel() {
  const alert = useAlert();

  const [view, setView] = useState("list"); // "list" | "form"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = (targetPage = page) => {
    setLoaded(false);
    const params = { page: targetPage };
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    listJobsAdmin(params)
      .then((res) => {
        setJobs(res.items);
        setPage(res.page || targetPage);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => alert.error(err.message || "Could not load jobs."))
      .finally(() => setLoaded(true));
  };

  useEffect(() => load(1), [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = () => load(1);
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    load(p);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setView("form");
  };

  const openEdit = async (id) => {
    try {
      const { job } = await getJobAdmin(id);
      setEditingId(id);
      setForm({
        title: job.title,
        department: job.department,
        employmentType: job.employmentType,
        location: job.location,
        workMode: job.workMode,
        experience: job.experience,
        salary: {
          configured: !!job.salary?.configured,
          min: job.salary?.min ?? "",
          max: job.salary?.max ?? "",
          currency: job.salary?.currency || "INR",
          period: job.salary?.period || "yearly",
          note: job.salary?.note || "",
        },
        shortDescription: job.shortDescription || "",
        description: job.description || "",
        responsibilitiesText: (job.responsibilities || []).join("\n"),
        requirementsText: (job.requirements || []).join("\n"),
        preferredQualificationsText: (job.preferredQualifications || []).join("\n"),
        benefitsText: (job.benefits || []).join("\n"),
        applicationQuestions: (job.applicationQuestions || []).map((q) => ({
  ...q,
  optionsText: (q.options || []).join(", "),
})),
        closingDate: job.closingDate ? new Date(job.closingDate).toISOString().slice(0, 10) : "",
      });
      setView("form");
    } catch (err) {
      alert.error(err.message || "Could not load this job.");
    }
  };

  const backToList = () => {
    setView("list");
    load();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.department.trim() || !form.location.trim() || !form.experience.trim()) {
      alert.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      department: form.department.trim(),
      employmentType: form.employmentType,
      location: form.location.trim(),
      workMode: form.workMode,
      experience: form.experience.trim(),
      salary: form.salary.configured
        ? {
            configured: true,
            min: form.salary.min === "" ? null : Number(form.salary.min),
            max: form.salary.max === "" ? null : Number(form.salary.max),
            currency: form.salary.currency,
            period: form.salary.period,
            note: form.salary.note,
          }
        : { configured: false },
      shortDescription: form.shortDescription,
      description: form.description,
      responsibilities: linesToArray(form.responsibilitiesText),
      requirements: linesToArray(form.requirementsText),
      preferredQualifications: linesToArray(form.preferredQualificationsText),
      benefits: linesToArray(form.benefitsText),
      applicationQuestions: form.applicationQuestions.map((q) => ({
  id: q.id,
  text: q.text,
  type: q.type,
  required: q.required,
  order: q.order,
  options:
    q.type === "single_choice" || q.type === "multiple_choice"
      ? (q.optionsText || "").split(",").map((o) => o.trim()).filter(Boolean)
      : [],
})),
      closingDate: form.closingDate || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateJobAdmin(editingId, payload);
        alert.success("Job updated.");
      } else {
        await createJobAdmin(payload);
        alert.success("Job saved as draft.");
      }
      backToList();
    } catch (err) {
      alert.error(err.message || "Could not save this job.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? This can't be undone.`)) return;
    try {
      await deleteJobAdmin(job._id);
      alert.success("Job deleted.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not delete this job.");
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishJobAdmin(id);
      alert.success("Job published.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not publish this job.");
    }
  };

  const handleClose = async (id) => {
    try {
      await closeJobAdmin(id);
      alert.success("Job closed.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not close this job.");
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this job? It will no longer be an active public opportunity.")) return;
    try {
      await archiveJobAdmin(id);
      alert.success("Job archived.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not archive this job.");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateJobAdmin(id);
      alert.success("Job duplicated as a new draft.");
      load();
    } catch (err) {
      alert.error(err.message || "Could not duplicate this job.");
    }
  };

  // ---------------------------------------------------------------------
  // FORM VIEW
  // ---------------------------------------------------------------------
  if (view === "form") {
    return (
      <div className="staff-panel">
        <div className="admin-panel-head">
          <h2>{editingId ? "Edit Job" : "Add New Job"}</h2>
          <button className="admin-btn" onClick={backToList}>
            &larr; Back to all jobs
          </button>
        </div>

        <form className="admin-card staff-create-form" onSubmit={submit}>
          <div className="staff-create-grid">
            <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
              <span>Title</span>
              <input
                required
                maxLength={160}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>

            <label className="admin-field">
              <span>Department</span>
              <input
                required
                maxLength={100}
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              />
            </label>

            <label className="admin-field">
              <span>Location</span>
              <input
                required
                maxLength={160}
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </label>

            <label className="admin-field">
              <span>Employment type</span>
              <select
                value={form.employmentType}
                onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Work mode</span>
              <select value={form.workMode} onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value }))}>
                {WORK_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Experience</span>
              <input
                required
                maxLength={60}
                placeholder="e.g. 2-4 years"
                value={form.experience}
                onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              />
            </label>

            <label className="admin-field">
              <span>Closing date (optional)</span>
              <input
                type="date"
                value={form.closingDate}
                onChange={(e) => setForm((f) => ({ ...f, closingDate: e.target.value }))}
              />
            </label>

            <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
              <span>Short description ({form.shortDescription.length}/300)</span>
              <textarea
                rows={2}
                maxLength={300}
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
              />
            </label>

            <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
              <span>Full description</span>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>

            <LinesField
              label="Responsibilities"
              value={form.responsibilitiesText}
              onChange={(v) => setForm((f) => ({ ...f, responsibilitiesText: v }))}
            />
            <LinesField
              label="Requirements"
              value={form.requirementsText}
              onChange={(v) => setForm((f) => ({ ...f, requirementsText: v }))}
            />
            <LinesField
              label="Preferred qualifications"
              value={form.preferredQualificationsText}
              onChange={(v) => setForm((f) => ({ ...f, preferredQualificationsText: v }))}
            />
            <LinesField
              label="Benefits"
              value={form.benefitsText}
              onChange={(v) => setForm((f) => ({ ...f, benefitsText: v }))}
            />

            <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
              <span className="careers-salary-toggle">
                <input
                  type="checkbox"
                  checked={form.salary.configured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary: { ...f.salary, configured: e.target.checked } }))
                  }
                />
                Configure salary
              </span>
              {form.salary.configured && (
                <div className="careers-salary-grid">
                  <input
                    type="number"
                    placeholder="Min"
                    value={form.salary.min}
                    onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, min: e.target.value } }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={form.salary.max}
                    onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, max: e.target.value } }))}
                  />
                  <input
                    placeholder="Currency"
                    maxLength={10}
                    value={form.salary.currency}
                    onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, currency: e.target.value } }))}
                  />
                  <select
                    value={form.salary.period}
                    onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, period: e.target.value } }))}
                  >
                    <option value="yearly">per year</option>
                    <option value="monthly">per month</option>
                  </select>
                  <input
                    placeholder="Note (e.g. Competitive, based on experience)"
                    maxLength={200}
                    style={{ gridColumn: "1 / -1" }}
                    value={form.salary.note}
                    onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, note: e.target.value } }))}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="admin-field">
            <span>Application questions</span>
            <QuestionsBuilder
              questions={form.applicationQuestions}
              onChange={(qs) => setForm((f) => ({ ...f, applicationQuestions: qs }))}
            />
          </div>

          <button className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "Save as Draft"}
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // LIST VIEW
  // ---------------------------------------------------------------------
  return (
    <div className="staff-panel">
      <div className="admin-panel-head">
        <h2>Jobs</h2>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          + Add New Job
        </button>
      </div>

      <div className="admin-card blog-filters">
        <input
          placeholder="Search title, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className="admin-btn" onClick={runSearch}>
          Search
        </button>
      </div>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && jobs.length === 0 && <p className="admin-empty">No jobs yet.</p>}
        {jobs.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.department}</td>
                    <td>{job.location}</td>
                    <td>{EMPLOYMENT_TYPES.find((t) => t.value === job.employmentType)?.label || job.employmentType}</td>
                    <td>
                      <span className={`admin-badge ${STATUS_BADGE[job.status] || ""}`}>{job.status}</span>
                    </td>
                    <td>{job.applicationCount}</td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="blog-actions">
                      <button className="admin-btn" onClick={() => openEdit(job._id)}>
                        Edit
                      </button>
                      {job.status !== "OPEN" && job.status !== "ARCHIVED" && (
                        <button className="admin-btn" onClick={() => handlePublish(job._id)}>
                          Publish
                        </button>
                      )}
                      {job.status === "OPEN" && (
                        <button className="admin-btn" onClick={() => handleClose(job._id)}>
                          Close
                        </button>
                      )}
                      <button className="admin-btn" onClick={() => handleDuplicate(job._id)}>
                        Duplicate
                      </button>
                      {job.status !== "ARCHIVED" && (
                        <button className="admin-btn" onClick={() => handleArchive(job._id)}>
                          Archive
                        </button>
                      )}
                      {job.applicationCount === 0 && (
                        <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(job)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loaded && totalPages > 1 && (
          <div className="blog-pagination-bar">
            <button className="admin-btn" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              &larr; Previous
            </button>
            <span className="blog-pagination-status">
              Page {page} of {totalPages}
            </span>
            <button className="admin-btn" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
