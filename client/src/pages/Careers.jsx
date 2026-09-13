import { useEffect, useState } from "react";
import { listCareersJobs } from "../api/client";
import { useSeo } from "../hooks/useSeo";
import JobCard from "../components/careers/JobCard";
import "./Careers.css";

const EMPLOYMENT_TYPES = [
  { value: "", label: "All types" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
];

const WORK_MODES = [
  { value: "", label: "All modes" },
  { value: "on_site", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export default function Careers() {
  useSeo({
    title: "Careers | Quick Transolution",
    description:
      "Explore current openings at Quick Transolution and build your career in logistics, supply chain, and transportation.",
  });

  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { page };
    if (department) params.department = department;
    if (employmentType) params.employmentType = employmentType;
    if (workMode) params.workMode = workMode;
    if (search) params.search = search;

    listCareersJobs(params)
      .then((res) => {
        setItems(res.items);
        setTotalPages(res.totalPages);
        setDepartments(res.departments || []);
      })
      .catch((err) => setError(err.message || "Could not load openings right now."))
      .finally(() => setLoading(false));
  }, [page, department, employmentType, workMode, search]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <section className="section careers-page">
      <div className="container">
        <div className="careers-hero">
          <span className="eyebrow">Careers</span>
          <h1>Build your career with us.</h1>
          <p>
            We&rsquo;re a team moving freight across India, Nepal, Bhutan &amp; Bangladesh &mdash;
            explore current openings and find where you fit.
          </p>
        </div>

        <div className="careers-filters">
          <input
            type="search"
            placeholder="Search job title or description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="careers-search-input"
            aria-label="Search openings"
          />
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by department"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={employmentType}
            onChange={(e) => {
              setEmploymentType(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by employment type"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={workMode}
            onChange={(e) => {
              setWorkMode(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by work mode"
          >
            {WORK_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="careers-status">Loading openings...</p>}
        {!loading && error && <p className="careers-status careers-status-error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="careers-status">
            No openings match these filters right now &mdash; please check back soon.
          </p>
        )}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="careers-grid">
              {items.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="careers-pagination" aria-label="Careers pagination">
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                  &larr; Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next &rarr;
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
