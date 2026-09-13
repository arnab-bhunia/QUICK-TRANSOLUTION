import JobsPanel from "./JobsPanel";
import ApplicationsPanel from "./ApplicationsPanel";

// Thin router between the two Careers sub-tabs (see AdminDashboard.jsx's
// TABS config — "careers" has subTabs "jobs"/"applications", exactly
// the same shape as StaffPanel's directory/add-member split). Kept as
// its own tiny file rather than inlined in AdminDashboard so that file
// doesn't need to know about Careers' internal jobs/applications split
// at all — it just passes `view` through, same as it does for StaffPanel.
export default function CareersPanel({ view }) {
  if (view === "applications") return <ApplicationsPanel />;
  return <JobsPanel />;
}
