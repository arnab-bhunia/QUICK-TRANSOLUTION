import { Routes, Route } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import AdminApp from "./admin/AdminApp";

// Top-level branch: /admin/* gets its own separate shell (no public
// TopBar/Navbar/Footer/chat widget/quote modal — see admin/AdminApp.jsx).
// Everything else renders the public site via SiteLayout.
function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<SiteLayout />} />
    </Routes>
  );
}

export default App;
