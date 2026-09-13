import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCareersJobBySlug, submitJobApplication } from "../api/client";
import { getVisitorId } from "../utils/visitorId";
import { useSeo } from "../hooks/useSeo";
import "./JobApply.css";

// Mirrors the ceiling middleware/careersUpload.js enforces server-side —
// checked here too so a candidate finds out their file is too big
// immediately, not after a full upload round-trip.
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  currentLocation: "",
  totalExperience: "",
  currentRole: "",
  expectedSalary: "",
  noticePeriod: "",
  linkedin: "",
  github: "",
  portfolio: "",
  coverLetter: "",
  policyAccepted: false,
};

function QuestionField({ question, value, onChange }) {
  const { id, type, required, options } = question;

  if (type === "long_text") {
    return (
      <textarea
        rows={4}
        required={required}
        value={value || ""}
        onChange={(e) => onChange(id, e.target.value)}
      />
    );
  }
  if (type === "single_choice" || type === "yes_no") {
    const opts = type === "yes_no" ? ["yes", "no"] : options;
    return (
      <div className="job-apply-radio-group">
        {opts.map((opt) => (
          <label key={opt} className="job-apply-radio-option">
            <input
              type="radio"
              name={id}
              required={required}
              checked={value === opt}
              onChange={() => onChange(id, opt)}
            />
            <span>{type === "yes_no" ? (opt === "yes" ? "Yes" : "No") : opt}</span>
          </label>
        ))}
      </div>
    );
  }
  if (type === "multiple_choice") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="job-apply-radio-group">
        {options.map((opt) => (
          <label key={opt} className="job-apply-radio-option">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...selected, opt]
                  : selected.filter((v) => v !== opt);
                onChange(id, next);
              }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }
  // short_text (default)
  return (
    <input
      type="text"
      required={required}
      value={value || ""}
      onChange={(e) => onChange(id, e.target.value)}
    />
  );
}

export default function JobApply() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [answers, setAnswers] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [applicationId, setApplicationId] = useState("");

  useSeo({
    title: job ? `Apply — ${job.title} | Quick Transolution` : "Apply | Quick Transolution",
  });

  useEffect(() => {
    setLoading(true);
    getCareersJobBySlug(slug)
      .then((res) => {
        setJob(res.job);
        setIsOpen(res.isOpenForApplications);
      })
      .catch((err) => setLoadError(err.message || "Could not load this job."))
      .finally(() => setLoading(false));
  }, [slug]);

  const sortedQuestions = useMemo(
    () => [...(job?.applicationQuestions || [])].sort((a, b) => a.order - b.order),
    [job]
  );

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updateAnswer(id, value) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function handleResumeChange(e) {
    const file = e.target.files?.[0];
    setResumeError("");
    setResumeFile(null);
    if (!file) return;

    if (file.type !== "application/pdf") {
      setResumeError("Resume must be a PDF file.");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("Resume must be under 10 MB.");
      return;
    }
    setResumeFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!resumeFile) {
      setResumeError("Please attach your resume as a PDF.");
      return;
    }
    if (!form.policyAccepted) {
      setErrorMessage("Please accept the Privacy Policy and Careers/Application Policy.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("currentLocation", form.currentLocation);
    fd.append("totalExperience", form.totalExperience);
    fd.append("currentRole", form.currentRole);
    fd.append("expectedSalary", form.expectedSalary);
    fd.append("noticePeriod", form.noticePeriod);
    fd.append("linkedin", form.linkedin);
    fd.append("github", form.github);
    fd.append("portfolio", form.portfolio);
    fd.append("coverLetter", form.coverLetter);
    fd.append("policyAccepted", "true");
    fd.append(
      "answers",
      JSON.stringify(sortedQuestions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? null })))
    );
    fd.append("sessionId", getVisitorId());
    fd.append("resume", resumeFile);

    try {
      const res = await submitJobApplication(slug, fd);
      setApplicationId(res.applicationId);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Could not submit your application. Please try again.");
    }
  }

  if (loading) {
    return (
      <section className="section job-apply-page">
        <div className="container job-apply-container">
          <p className="job-apply-status">Loading...</p>
        </div>
      </section>
    );
  }

  if (loadError || !job) {
    return (
      <section className="section job-apply-page">
        <div className="container job-apply-container">
          <p className="job-apply-status job-apply-status-error">
            {loadError || "This job could not be found."}
          </p>
          <Link to="/careers" className="btn btn-outline">
            Back to Careers
          </Link>
        </div>
      </section>
    );
  }

  if (!isOpen) {
    return (
      <section className="section job-apply-page">
        <div className="container job-apply-container">
          <div className="job-apply-closed">
            <h1>Applications closed</h1>
            <p>
              &ldquo;{job.title}&rdquo; is no longer accepting applications. Please check our
              Careers page for other current openings.
            </p>
            <Link to="/careers" className="btn btn-primary">
              View Openings
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === "success") {
    return (
      <section className="section job-apply-page">
        <div className="container job-apply-container">
          <div className="job-apply-success">
            <span className="job-apply-success-icon" aria-hidden="true">
              ✓
            </span>
            <h1>Application received!</h1>
            <p>Thank you for applying for {job.title}. Our recruitment team will review your application.</p>
            <div className="job-apply-success-id">
              <span>Application ID</span>
              <strong>{applicationId}</strong>
            </div>
            <p className="job-apply-success-note">
              A confirmation email has been sent to {form.email}. Please keep this ID for your records.
            </p>
            <button className="btn btn-outline" onClick={() => navigate("/careers")}>
              Back to Careers
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section job-apply-page">
      <div className="container job-apply-container">
        <Link to={`/careers/jobs/${slug}`} className="job-details-back">
          &larr; Back to job details
        </Link>

        <header className="job-apply-head">
          <span className="eyebrow">Apply for</span>
          <h1>{job.title}</h1>
          <p>{job.department} &middot; {job.location}</p>
        </header>

        <form className="job-apply-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Personal Information</legend>
            <label>
              Full Name <span className="req">*</span>
              <input type="text" required maxLength={100} value={form.name} onChange={update("name")} />
            </label>
            <div className="job-apply-row">
              <label>
                Email <span className="req">*</span>
                <input type="email" required maxLength={254} value={form.email} onChange={update("email")} />
              </label>
              <label>
                Phone Number <span className="req">*</span>
                <input type="tel" required maxLength={20} value={form.phone} onChange={update("phone")} />
              </label>
            </div>
            <label>
              Current Location <span className="req">*</span>
              <input
                type="text"
                required
                maxLength={200}
                value={form.currentLocation}
                onChange={update("currentLocation")}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Professional Information</legend>
            <label>
              Total Experience <span className="req">*</span>
              <input
                type="text"
                required
                placeholder="e.g. 3 years"
                maxLength={60}
                value={form.totalExperience}
                onChange={update("totalExperience")}
              />
            </label>
            <div className="job-apply-row">
              <label>
                Current / Most Recent Role
                <input type="text" maxLength={150} value={form.currentRole} onChange={update("currentRole")} />
              </label>
              <label>
                Expected Salary
                <input
                  type="text"
                  maxLength={100}
                  value={form.expectedSalary}
                  onChange={update("expectedSalary")}
                />
              </label>
            </div>
            <label>
              Notice Period
              <input type="text" maxLength={60} value={form.noticePeriod} onChange={update("noticePeriod")} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Professional Links</legend>
            <label>
              LinkedIn
              <input type="url" maxLength={300} placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={update("linkedin")} />
            </label>
            <label>
              GitHub
              <input type="url" maxLength={300} placeholder="https://github.com/..." value={form.github} onChange={update("github")} />
            </label>
            <label>
              Portfolio / Website
              <input type="url" maxLength={300} value={form.portfolio} onChange={update("portfolio")} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Resume</legend>
            <label className="job-apply-file-label">
              Resume (PDF only) <span className="req">*</span>
              <input type="file" accept="application/pdf" onChange={handleResumeChange} required />
            </label>
            {resumeFile && <p className="job-apply-file-name">Selected: {resumeFile.name}</p>}
            {resumeError && <p className="job-apply-field-error">{resumeError}</p>}
          </fieldset>

          <fieldset>
            <legend>Cover Letter</legend>
            <label>
              Tell us why you&rsquo;re a great fit (optional)
              <textarea
                rows={5}
                maxLength={5000}
                value={form.coverLetter}
                onChange={update("coverLetter")}
              />
            </label>
          </fieldset>

          {sortedQuestions.length > 0 && (
            <fieldset>
              <legend>Additional Questions</legend>
              {sortedQuestions.map((q) => (
                <label key={q.id}>
                  {q.text} {q.required && <span className="req">*</span>}
                  <QuestionField question={q} value={answers[q.id]} onChange={updateAnswer} />
                </label>
              ))}
            </fieldset>
          )}

          <label className="job-apply-consent">
            <input
              type="checkbox"
              checked={form.policyAccepted}
              onChange={(e) => setForm((f) => ({ ...f, policyAccepted: e.target.checked }))}
              required
            />
            <span>
              I agree to the{" "}
              <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms-conditions" target="_blank" rel="noopener noreferrer">
                Careers/Application Policy
              </Link>
              .
            </span>
          </label>

          {status === "error" && <p className="job-apply-field-error">{errorMessage}</p>}

          <button
            className="btn btn-primary job-apply-submit"
            disabled={status === "submitting" || !form.policyAccepted}
          >
            {status === "submitting" ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </section>
  );
}
