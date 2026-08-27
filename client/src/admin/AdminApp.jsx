import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePassword from "./pages/ChangePassword";
import "./AdminApp.css";

function RequireStaffAuth({ children }) {
  const { staff, loading } = useAdminAuth();
  if (loading) return null;
  if (!staff) return <Navigate to="/admin/login" replace />;
  // A temp password (e.g. one created via the "same as DOB" convenience
  // option) must be changed before the account can do anything else.
  if (staff.mustChangePassword) return <ChangePassword />;
  return children;
}

function AdminHeader() {
  const { staff, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <header className="admin-header">
      <span className="admin-header-brand">Quick Transolution — Staff Portal</span>
      <div className="admin-header-right">
        <span className="admin-header-user">{staff?.name}</span>
        <button
          className="admin-btn admin-btn-ghost logout-btn"
          onClick={() => {
            navigate("/");
            logout();
          }}
        >
          Log out
        </button>
      </div>
    </header>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="*"
        element={
          <RequireStaffAuth>
            <>
              <AdminHeader />
              <AdminDashboard />
            </>
          </RequireStaffAuth>
        }
      />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <div className="admin-shell">
        <AdminRoutes />
      </div>
    </AdminAuthProvider>
  );
}
