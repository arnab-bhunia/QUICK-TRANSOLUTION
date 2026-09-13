import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getCareersJobBySlug } from "../api/client";
import { useSeo } from "../hooks/useSeo";
import "./JobDetails.css";

const EMPLOYMENT_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
};

const WORK_MODE_LABELS = {
  on_site: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatSalary(salary) {
  if (!salary?.configured) return null;
  if (salary.note) return salary.note;
  if (salary.min && salary.max) {
    return `${salary.currency} ${salary.min.toLocaleString()} – ${salary.max.toLocaleString()} / ${
      salary.period === "monthly" ? "month" : "year"
    }`;
  }
  return null;
}

function BulletSection({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="job-details-section">
      <h2>{title}</h2>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function JobDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getCareersJobBySlug(slug)
      .then((res) => {
        if (res.canonicalSlug && res.canonicalSlug !== slug) {
          // Old/previous slug — nothing to redirect via router here
          // beyond just rendering under the current data; the address
          // bar staying on the old slug is harmless (same convention
          // BlogDetails.jsx follows).
        }
        setData(res);
      })
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useSeo({
    title: data?.job ? `${data.job.title} | Careers | Quick Transolution` : "Careers | Quick Transolution",
    description: data?.job?.shortDescription || "Explore this opening at Quick Transolution.",
  });

  if (notFound) return <Navigate to="/careers" replace />;

  if (loading) {
    return (
      <section className="section job-details-page">
        <div className="container">
          <p className="job-details-status">Loading job details...</p>
        </div>
      </section>
    );
  }

  if (!data?.job) return null;

  const { job, isOpenForApplications } = data;
  const salaryText = formatSalary(job.salary);
  const deadline = formatDate(job.closingDate);

  return (
    <section className="section job-details-page">
      <div className="container job-details-container">
        <Link to="/careers" className="job-details-back">
          &larr; Back to all openings
        </Link>

        <header className="job-details-head">
          <span className="eyebrow">{job.department}</span>
          <h1>{job.title}</h1>
          <div className="job-details-tags">
            <span className="job-card-tag">{EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}</span>
            <span className="job-card-tag">{WORK_MODE_LABELS[job.workMode] || job.workMode}</span>
            <span className="job-card-tag">{job.location}</span>
            <span className="job-card-tag">{job.experience}</span>
            {salaryText && <span className="job-card-tag">{salaryText}</span>}
          </div>
        </header>

        <div className="job-details-body">
          <div className="job-details-main">
            {job.description && (
              <div className="job-details-section">
                <h2>About the Role</h2>
                <p className="job-details-description">{job.description}</p>
              </div>
            )}
            <BulletSection title="Responsibilities" items={job.responsibilities} />
            <BulletSection title="Requirements" items={job.requirements} />
            <BulletSection title="Preferred Qualifications" items={job.preferredQualifications} />
            <BulletSection title="Benefits" items={job.benefits} />
          </div>

          <aside className="job-details-sidebar">
            {deadline && (
              <div className="job-details-deadline">
                <span>Application Deadline</span>
                <strong>{deadline}</strong>
              </div>
            )}

            {isOpenForApplications ? (
              <Link to={`/careers/jobs/${job.slug}/apply`} className="btn btn-primary job-details-apply-btn">
                Apply Now
              </Link>
            ) : (
              <div className="job-details-closed" role="status">
                <strong>This role is no longer accepting applications.</strong>
                <p>Please check our Careers page for other current openings.</p>
              </div>
            )}

            <Link to="/careers" className="job-details-all-link">
              View all openings &rarr;
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
