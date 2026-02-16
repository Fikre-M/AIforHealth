import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';

// Eager load critical components (above the fold)
import { LandingPage } from '@/features/landing/components/LandingPage';
import { LoginForm, RegisterForm } from '@/features/auth/components';

// Lazy load non-critical routes
const ForgotPasswordForm = lazy(() => 
  import('@/features/auth/components').then(m => ({ default: m.ForgotPasswordForm }))
);
const ResetPasswordForm = lazy(() => 
  import('@/features/auth/components').then(m => ({ default: m.ResetPasswordForm }))
);
const PatientDashboard = lazy(() => 
  import('@/features/dashboard/components/PatientDashboard').then(m => ({ default: m.PatientDashboard }))
);
const DoctorDashboard = lazy(() => 
  import('@/features/dashboard/components/DoctorDashboard').then(m => ({ default: m.DoctorDashboard }))
);
const AIChat = lazy(() => 
  import('@/features/chat/components/AIChat').then(m => ({ default: m.AIChat }))
);
const AISymptomChecker = lazy(() => 
  import('@/features/symptomChecker/components/AISymptomChecker').then(m => ({ default: m.AISymptomChecker }))
);
const AppointmentBooking = lazy(() => 
  import('@/features/booking/components/AppointmentBooking').then(m => ({ default: m.AppointmentBooking }))
);
const AppointmentsPage = lazy(() => 
  import('@/features/appointments').then(m => ({ default: m.AppointmentsPage }))
);
const PatientsPage = lazy(() => 
  import('@/features/patients').then(m => ({ default: m.PatientsPage }))
);
const AddPatientPage = lazy(() => 
  import('@/features/patients').then(m => ({ default: m.AddPatientPage }))
);
const AnalyticsPage = lazy(() => 
  import('@/features/analytics').then(m => ({ default: m.AnalyticsPage }))
);
const NotificationsPage = lazy(() => 
  import('@/features/notifications/components/NotificationsPage').then(m => ({ default: m.NotificationsPage }))
);
const ProfilePage = lazy(() => 
  import('@/features/profile').then(m => ({ default: m.ProfilePage }))
);
const SettingsPage = lazy(() => 
  import('@/features/profile').then(m => ({ default: m.SettingsPage }))
);

// Loading fallback component
function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="large" />
    </div>
  );
}

// Dashboard component with lazy loading
function Dashboard() {
  const { user } = useAuth();
  
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      {user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
    </Suspense>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// Lazy route wrapper with error boundary
function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Eagerly loaded routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Lazy loaded auth routes */}
        <Route path="/forgot-password" element={
          <LazyRoute>
            <ForgotPasswordForm />
          </LazyRoute>
        } />
        <Route path="/reset-password" element={
          <LazyRoute>
            <ResetPasswordForm />
          </LazyRoute>
        } />
        
        {/* Protected app routes with lazy loading */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="ai-chat" element={
            <ProtectedRoute>
              <LazyRoute>
                <AIChat />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="symptom-checker" element={
            <ProtectedRoute>
              <LazyRoute>
                <AISymptomChecker />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="notifications" element={
            <ProtectedRoute>
              <LazyRoute>
                <NotificationsPage />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="appointments" element={
            <ProtectedRoute>
              <LazyRoute>
                <AppointmentsPage />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="appointments/book" element={
            <ProtectedRoute>
              <LazyRoute>
                <AppointmentBooking />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="patients" element={
            <ProtectedRoute>
              <LazyRoute>
                <PatientsPage />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="patients/new" element={
            <ProtectedRoute>
              <LazyRoute>
                <AddPatientPage />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="analytics" element={
            <ProtectedRoute>
              <LazyRoute>
                <AnalyticsPage />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <LazyRoute>
                <ProfilePage />
              </LazyRoute>
            </ProtectedRoute>
          } />
          
          <Route path="settings" element={
            <ProtectedRoute>
              <LazyRoute>
                <SettingsPage />
              </LazyRoute>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
