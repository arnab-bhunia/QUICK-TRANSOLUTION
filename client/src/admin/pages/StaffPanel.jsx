import { useEffect, useState } from "react";
import { listStaffAdmin, createStaffAdmin } from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import { OFFICES } from "../../config/offices";
import "./StaffPanel.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emptyForm = {
  name: "",
  email: "",
  mobileNumber: "",
  officeCode: "",
  dob: "",
  bloodGroup: "",
  password: "",
  role: "staff",
};

// Formats a yyyy-mm-dd date-input value as an 8-digit DDMMYYYY string —
// used only as a convenience starting point for the temporary password
// field. It always satisfies the 8-character minimum, but it is a weak,
// guessable password on its own (anyone who knows the staff member's
// birthday can guess it), so accounts created this way are forced to
// change their password on first login (see mustChangePassword).
function dobToPassword(dobValue) {
  if (!dobValue) return "";
  const [year, month, day] = dobValue.split("-");
  if (!year || !month || !day) return "";
  return `${day}${month}${year}`;
}

export default function StaffPanel() {
  const alert = useAlert();
  const [staffList, setStaffList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [passwordFromDob, setPasswordFromDob] = useState(false);
  const [status, setStatus] = useState("idle");

  const load = () => {
    listStaffAdmin()
      .then(setStaffList)
      .catch((err) => alert.error(err.message || "Could not load staff list."))
      .finally(() => setLoaded(true));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field) => (e) => {
    const { value } = e.target;
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Keep the temp password in sync with DOB while the convenience
      // option is on, so changing the date updates the generated value.
      if (field === "dob" && passwordFromDob) {
        next.password = dobToPassword(value);
      }
      return next;
    });
  };

  const togglePasswordFromDob = (e) => {
    const checked = e.target.checked;
    setPasswordFromDob(checked);
    setForm((f) => ({ ...f, password: checked ? dobToPassword(f.dob) : "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await createStaffAdmin(form);
      alert.success(`${form.role === "admin" ? "Admin" : "Staff"} account created.`);
      setForm(emptyForm);
      setPasswordFromDob(false);
      load();
    } catch (err) {
      alert.error(err.message || "Could not create account.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="staff-panel">
      <div className="admin-panel-head">
        <h2>Staff Accounts</h2>
      </div>

      <form className="admin-card staff-create-form" onSubmit={submit}>
        <div className="staff-create-grid">
          <label className="admin-field">
            <span>Full name</span>
            <input required value={form.name} onChange={update("name")} />
          </label>
          <label className="admin-field">
            <span>Email</span>
            <input type="email" required value={form.email} onChange={update("email")} />
          </label>

          <label className="admin-field">
            <span>Mobile number</span>
            <input
              type="tel"
              required
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={form.mobileNumber}
              onChange={update("mobileNumber")}
              title="Enter a valid 10-digit mobile number"
            />
          </label>

          <label className="admin-field">
            <span>Office</span>
            <select required value={form.officeCode} onChange={update("officeCode")}>
              <option value="" disabled>
                Select office
              </option>
              {OFFICES.map((office) => (
                <option key={office.code} value={office.code}>
                  {office.code} — {office.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Date of birth</span>
            <input type="date" required value={form.dob} onChange={update("dob")} />
          </label>

          <label className="admin-field">
            <span>Blood group (optional)</span>
            <select value={form.bloodGroup} onChange={update("bloodGroup")}>
              <option value="">Not specified</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Temporary password</span>
            <input
              type="text"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
              disabled={passwordFromDob}
              autoComplete="new-password"
            />
            <span className="staff-field-checkbox">
              <input
                id="password-from-dob"
                type="checkbox"
                checked={passwordFromDob}
                onChange={togglePasswordFromDob}
                disabled={!form.dob}
              />
              <label htmlFor="password-from-dob">Same as date of birth (DDMMYYYY)</label>
            </span>
          </label>

          <label className="admin-field">
            <span>Role</span>
            <select value={form.role} onChange={update("role")}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>

        {passwordFromDob && (
          <p className="staff-security-note">
            A DOB-based password is easy to guess. The staff member will be required to set a
            new password the first time they log in.
          </p>
        )}

        <button className="admin-btn admin-btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && staffList.length === 0 && <p className="admin-empty">No staff accounts yet.</p>}
        {staffList.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Office</th>
                  <th>DOB</th>
                  <th>Blood Group</th>
                  <th>Role</th>
                  <th>Password</th>
                  <th>Last Login</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.mobileNumber}</td>
                    <td>{s.officeName ? `${s.officeCode} — ${s.officeName}` : s.officeCode}</td>
                    <td>{s.dob ? new Date(s.dob).toLocaleDateString() : "—"}</td>
                    <td>{s.bloodGroup || "—"}</td>
                    <td>
                      <span className={`admin-badge ${s.role === "admin" ? "admin-badge-converted" : "admin-badge-contacted"}`}>
                        {s.role}
                      </span>
                    </td>
                    <td>
                      {s.mustChangePassword ? (
                        <span className="admin-badge admin-badge-on_hold">Change required</span>
                      ) : (
                        <span className="admin-badge admin-badge-contacted">OK</span>
                      )}
                    </td>
                    <td>{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : "Never"}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
