import { Link } from "react-router-dom";
import "./JobCard.css";

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

function formatDeadline(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JobCard({ job }) {
  const deadline = formatDeadline(job.closingDate);

  return (
    <article className="job-card">
      <div className="job-card-head">
        <span className="job-card-department">{job.department}</span>
        <h3>{job.title}</h3>
      </div>

      <div className="job-card-tags">
        <span className="job-card-tag">{EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}</span>
        <span className="job-card-tag">{WORK_MODE_LABELS[job.workMode] || job.workMode}</span>
        <span className="job-card-tag">{job.location}</span>
        <span className="job-card-tag">{job.experience}</span>
      </div>

      {job.shortDescription && <p className="job-card-desc">{job.shortDescription}</p>}

      <div className="job-card-foot">
        {deadline ? (
          <span className="job-card-deadline">Apply by {deadline}</span>
        ) : (
          <span className="job-card-deadline">Rolling applications</span>
        )}
        <Link to={`/careers/jobs/${job.slug}`} className="btn btn-outline job-card-cta">
          View Job
        </Link>
      </div>
    </article>
  );
}
