import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  Users, 
  Settings, 
  Activity,
  Stethoscope,
  User,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';
import { useState } from 'react';

const patientNavItems = [
  { to: '/app/dashboard', icon: Home, label: 'Dashboard', description: 'View your health overview' },
  { to: '/app/appointments', icon: Calendar, label: 'Appointments', description: 'Manage your appointments' },
  { to: '/app/ai-chat', icon: MessageCircle, label: 'AI Assistant', description: 'Chat with AI health assistant' },
  { to: '/app/symptom-checker', icon: Activity, label: 'Symptom Checker', description: 'Check your symptoms' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications', description: 'View your notifications' },
  { to: '/app/profile', icon: User, label: 'Profile', description: 'Manage your profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings', description: 'App settings and preferences' },
];

const doctorNavItems = [
  { to: '/app/dashboard', icon: Home, label: 'Dashboard', description: 'View your practice overview' },
  { to: '/app/appointments', icon: Calendar, label: 'Appointments', description: 'Manage patient appointments' },
  { to: '/app/patients', icon: Users, label: 'Patients', description: 'View patient list' },
  { to: '/app/ai-chat', icon: MessageCircle, label: 'AI Assistant', description: 'AI medical assistant' },
  { to: '/app/symptom-checker', icon: Activity, label: 'Symptom Checker', description: 'Diagnostic tool' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications', description: 'Practice notifications' },
  { to: '/app/profile', icon: User, label: 'Profile', description: 'Professional profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings', description: 'Practice settings' },
];

const adminNavItems = [
  { to: '/app/dashboard', icon: Home, label: 'Dashboard', description: 'System overview' },
  { to: '/app/users', icon: Users, label: 'Users', description: 'Manage users' },
  { to: '/app/doctors', icon: Stethoscope, label: 'Doctors', description: 'Manage healthcare providers' },
  { to: '/app/analytics', icon: Activity, label: 'Analytics', description: 'System analytics' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications', description: 'System notifications' },
  { to: '/app/profile', icon: User, label: 'Profile', description: 'Admin profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings', description: 'System settings' },
];

export function Sidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const getNavItems = () => {
    switch (user?.role) {
      case 'doctor': return doctorNavItems;
      case 'admin': return adminNavItems;
      default: return patientNavItems;
    }
  };

  return (
    <aside 
      className={clsx(
        'hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-gray-900">Navigation</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="list">
        {getNavItems().map(({ to, icon: Icon, label, description }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                isCollapsed ? 'p-3 justify-center' : 'px-3 py-2 space-x-3',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
            title={isCollapsed ? `${label} - ${description}` : undefined}
            role="listitem"
          >
            <Icon 
              className={clsx(
                'flex-shrink-0 transition-colors',
                isCollapsed ? 'w-5 h-5' : 'w-5 h-5'
              )} 
              aria-hidden="true"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <span className="block truncate">{label}</span>
                <span className="block text-xs text-gray-400 truncate group-hover:text-gray-500">
                  {description}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="w-4 h-4 text-red-600" aria-hidden="true" />
              <span className="text-sm font-medium text-red-800">Emergency</span>
            </div>
            <p className="text-xs text-red-600 mb-2">
              For medical emergencies, call 911 immediately
            </p>
            <a
              href="tel:911"
              className="block w-full text-center bg-red-600 text-white text-xs font-medium py-2 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Call 911
            </a>
          </div>
        ) : (
          <a
            href="tel:911"
            className="flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Emergency - Call 911"
            aria-label="Emergency - Call 911"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
          </a>
        )}
      </div>
    </aside>
  );
}