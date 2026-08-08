import { useEffect, useState } from "react";
import { listStaffAdmin, createStaffAdmin } from "../../api/client";
import { useAlert } from "../../context/AlertContext";
import "./StaffPanel.css";

const emptyForm = { name: "", email: "", password: "", role: "staff" };

export default function StaffPanel() {
  const alert = useAlert();
  const [staffList, setStaffList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");

  const load = () => {
    listStaffAdmin()
      .then(setStaffList)
      .catch((err) => alert.error(err.message || "Could not load staff list."))
      .finally(() => setLoaded(true));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await createStaffAdmin(form);
      alert.success(`${form.role === "admin" ? "Admin" : "Staff"} account created.`);
      setForm(emptyForm);
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
            <span>Temporary password</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
            />
          </label>
          <label className="admin-field">
            <span>Role</span>
            <select value={form.role} onChange={update("role")}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <button className="admin-btn admin-btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="admin-card">
        {!loaded && <p className="admin-empty">Loading...</p>}
        {loaded && staffList.length === 0 && <p className="admin-empty">No staff accounts yet.</p>}
        {staffList.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>
                    <span className={`admin-badge ${s.role === "admin" ? "admin-badge-converted" : "admin-badge-contacted"}`}>
                      {s.role}
                    </span>
                  </td>
                  <td>{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : "Never"}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
