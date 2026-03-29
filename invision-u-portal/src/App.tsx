import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ApplicantApp } from "@/components/ApplicantApp";
import { RequireAdmin } from "@/components/RequireAdmin";
import { CommitteeLayout } from "@/layouts/CommitteeLayout";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { CommitteeCandidatesPage } from "@/pages/CommitteeCandidatesPage";
import { CommitteeDashboardPage } from "@/pages/CommitteeDashboardPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <Routes>
                <Route path="/committee/login" element={<AdminLoginPage />} />
                <Route
                  path="/committee"
                  element={
                    <RequireAdmin>
                      <CommitteeLayout />
                    </RequireAdmin>
                  }
                >
                  <Route
                    index
                    element={<Navigate to="/committee/dashboard" replace />}
                  />
                  <Route
                    path="dashboard"
                    element={<CommitteeDashboardPage />}
                  />
                  <Route
                    path="candidates"
                    element={<CommitteeCandidatesPage />}
                  />
                </Route>
                <Route path="/" element={<ApplicantApp />} />
                <Route path="*" element={<ApplicantApp />} />
              </Routes>
            </AdminAuthProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
