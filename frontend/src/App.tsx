import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { PatientDashboard } from '@/features/dashboard/components/PatientDashboard';
import { DoctorDashboard } from '@/features/dashboard/components/DoctorDashboard';
import { AIChat } from '@/features/chat/components/AIChat';
import { AISymptomChecker } from '@/features/symptomChecker/components/AISymptomChecker';
import { AppointmentBooking } from '@/features/booking/components/AppointmentBooking';
import { AppointmentsPage } from '@/features/appointments';
import { PatientsPage, AddPatientPage } from '@/features/patients';
import { AnalyticsPage } from '@/features/analytics';
import { NotificationsPage } from '@/features/notifications/components/NotificationsPage';
import { ProfilePage, SettingsPage } from '@/features/profile';
import { useAuth } from '@/hooks/useAuth';

function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }
  
  return <PatientDashboard />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="ai-chat" element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          } />
          <Route path="symptom-checker" element={
            <ProtectedRoute>
              <AISymptomChecker />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="appointments" element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="appointments/book" element={
            <ProtectedRoute>
              <AppointmentBooking />
            </ProtectedRoute>
          } />
          <Route path="patients" element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          } />
          <Route path="patients/new" element={
            <ProtectedRoute>
              <AddPatientPage />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;