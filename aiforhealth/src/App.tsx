import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { PatientDashboard } from '@/features/dashboard/components/PatientDashboard';
import { DoctorDashboard } from '@/features/dashboard/components/DoctorDashboard';
import { AIChat } from '@/features/chat/components/AIChat';
import { AppointmentBooking } from '@/features/booking/components/AppointmentBooking';
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
          <Route path="appointments" element={
            <ProtectedRoute>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          } />
          <Route path="appointments/book" element={
            <ProtectedRoute>
              <AppointmentBooking />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;