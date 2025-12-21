import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { PatientDashboard } from '@/features/dashboard/components/PatientDashboard';
import { DoctorDashboard } from '@/features/dashboard/components/DoctorDashboard';
import { AIChat } from '@/features/chat/components/AIChat';
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuth';

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

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="login" element={<LoginForm />} />
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

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;