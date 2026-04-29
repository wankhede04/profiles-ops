import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ApplicationsPage from "./pages/ApplicationsPage";
import DiffReviewPage from "./pages/DiffReviewPage";
import ProfileFormPage from "./pages/ProfileFormPage";
import ProfilesPage from "./pages/ProfilesPage";
import TailorPage from "./pages/TailorPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/profiles" replace />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/profiles/new" element={<ProfileFormPage />} />
            <Route path="/profiles/:profileId/tailor" element={<TailorPage />} />
            <Route
              path="/profiles/:profileId/versions/:versionId/review"
              element={<DiffReviewPage />}
            />
            <Route path="/applications" element={<ApplicationsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
