import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { CommitteeLayout } from './layouts/CommitteeLayout';

// Public Pages
import { PublicHome } from './pages/public/PublicHome';
import { ReportComplaint } from './pages/public/ReportComplaint';
import { TrackComplaint } from './pages/public/TrackComplaint';
import { HowItWorks } from './pages/public/HowItWorks';
import { EmergencyContacts } from './pages/public/EmergencyContacts';

// Auth Page
import { Login } from './pages/auth/Login';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminComplaintsList } from './pages/admin/AdminComplaintsList';
import { AdminComplaintDetail } from './pages/admin/AdminComplaintDetail';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminLocations } from './pages/admin/AdminLocations';
import { AdminQrCode } from './pages/admin/AdminQrCode';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Committee Pages
import { CommitteeDashboard } from './pages/committee/CommitteeDashboard';
import { CommitteeComplaintsList } from './pages/committee/CommitteeComplaintsList';
import { CommitteeComplaintDetail } from './pages/committee/CommitteeComplaintDetail';

// Error Page
import { NotFound } from './pages/NotFound';

// Protected Route Wrapper
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const ProtectedCommitteeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isCommitteeMember, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || (!isCommitteeMember && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Redirect to Universal Public QR Home */}
          <Route path="/" element={<Navigate to="/public" replace />} />

          {/* Public Routes */}
          <Route path="/public" element={<PublicLayout />}>
            <Route index element={<PublicHome />} />
            <Route path="report" element={<ReportComplaint />} />
            <Route path="track" element={<TrackComplaint />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="emergency" element={<EmergencyContacts />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaintsList />} />
            <Route path="complaints/:id" element={<AdminComplaintDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="qr" element={<AdminQrCode />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Protected Committee Routes */}
          <Route
            path="/committee"
            element={
              <ProtectedCommitteeRoute>
                <CommitteeLayout />
              </ProtectedCommitteeRoute>
            }
          >
            <Route index element={<Navigate to="/committee/dashboard" replace />} />
            <Route path="dashboard" element={<CommitteeDashboard />} />
            <Route path="complaints" element={<CommitteeComplaintsList />} />
            <Route path="complaints/:id" element={<CommitteeComplaintDetail />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
